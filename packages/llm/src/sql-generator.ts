import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import OpenAI from 'openai';

export interface SQLGenerationRequest {
  prompt: string;
  schema: string;
  module?: string;
}

export interface SQLGenerationResponse {
  sql: string;
  explanation: string;
  confidence: number;
}

export class LLMService {
  private bedrockClient: BedrockRuntimeClient;
  private openaiClient?: OpenAI;

  constructor() {
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });

    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async generateSQL(request: SQLGenerationRequest): Promise<SQLGenerationResponse> {
    const useOpenAI = process.env.USE_OPENAI === 'true' && this.openaiClient;
    
    if (useOpenAI) {
      return this.generateSQLWithOpenAI(request);
    } else {
      return this.generateSQLWithBedrock(request);
    }
  }

  private async generateSQLWithBedrock(request: SQLGenerationRequest): Promise<SQLGenerationResponse> {
    const prompt = this.buildPrompt(request);
    
    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    try {
      const response = await this.bedrockClient.send(command);
      const body = JSON.parse(new TextDecoder().decode(response.body));
      const content = body.content[0].text;
      
      return this.parseSQLResponse(content);
    } catch (error) {
      console.error('Bedrock SQL generation failed:', error);
      throw new Error('Failed to generate SQL with Bedrock');
    }
  }

  private async generateSQLWithOpenAI(request: SQLGenerationRequest): Promise<SQLGenerationResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = this.buildPrompt(request);
    
    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a SQL expert. Generate safe, read-only SQL queries based on user requests.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return this.parseSQLResponse(content);
  }

  private buildPrompt(request: SQLGenerationRequest): string {
    return `
You are a SQL expert for a CRM system. Generate a safe, read-only SQL query based on the user's request.

Database Schema:
${request.schema}

User Request: ${request.prompt}

IMPORTANT RULES:
1. Only generate SELECT statements (read-only)
2. Never include INSERT, UPDATE, DELETE, DROP, or other modifying statements
3. Always include proper WHERE clauses for tenant isolation
4. Use proper SQL syntax for PostgreSQL
5. Include LIMIT clauses to prevent large result sets
6. Explain what the query does

Respond in this JSON format:
{
  "sql": "SELECT ...",
  "explanation": "This query...",
  "confidence": 0.95
}
`;
  }

  private parseSQLResponse(content: string): SQLGenerationResponse {
    try {
      // Try to parse as JSON first
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          sql: parsed.sql || '',
          explanation: parsed.explanation || '',
          confidence: parsed.confidence || 0.5,
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response:', error);
    }

    // Fallback: extract SQL from markdown code blocks
    const sqlMatch = content.match(/```sql\n([\s\S]*?)\n```/);
    const sql = sqlMatch ? sqlMatch[1].trim() : content.trim();

    return {
      sql,
      explanation: 'Generated SQL query',
      confidence: 0.7,
    };
  }

  validateSQL(sql: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for dangerous keywords
    const dangerousKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 
      'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
    ];
    
    const upperSQL = sql.toUpperCase();
    for (const keyword of dangerousKeywords) {
      if (upperSQL.includes(keyword)) {
        errors.push(`Dangerous keyword detected: ${keyword}`);
      }
    }

    // Check for tenant isolation
    if (!upperSQL.includes('TENANT_ID') && !upperSQL.includes('TENANTID')) {
      errors.push('Query must include tenant isolation');
    }

    // Check for LIMIT clause
    if (!upperSQL.includes('LIMIT')) {
      errors.push('Query should include LIMIT clause for safety');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const llmService = new LLMService();
