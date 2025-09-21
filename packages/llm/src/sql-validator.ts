import { z } from 'zod';

export interface SQLValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedSQL?: string;
}

export interface SQLValidationOptions {
  maxRows?: number;
  timeoutMs?: number;
  allowedTables?: string[];
  forbiddenKeywords?: string[];
}

export class SQLValidator {
  private readonly defaultOptions: Required<SQLValidationOptions> = {
    maxRows: 1000,
    timeoutMs: 30000,
    allowedTables: [],
    forbiddenKeywords: [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
      'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'CALL', 'MERGE', 'UPSERT',
      'COPY', 'LOAD', 'IMPORT', 'EXPORT', 'BACKUP', 'RESTORE'
    ],
  };

  validate(sql: string, options: Partial<SQLValidationOptions> = {}): SQLValidationResult {
    const opts = { ...this.defaultOptions, ...options };
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic SQL parsing and validation
      const sanitizedSQL = this.sanitizeSQL(sql);
      
      // Check for forbidden keywords
      const forbiddenFound = this.checkForbiddenKeywords(sanitizedSQL, opts.forbiddenKeywords);
      if (forbiddenFound.length > 0) {
        errors.push(`Forbidden keywords detected: ${forbiddenFound.join(', ')}`);
      }

      // Ensure it's a SELECT statement
      if (!this.isSelectStatement(sanitizedSQL)) {
        errors.push('Only SELECT statements are allowed');
      }

      // Check for LIMIT clause
      if (!this.hasLimitClause(sanitizedSQL)) {
        warnings.push(`Query should include LIMIT clause (max ${opts.maxRows} rows)`);
      } else {
        const limit = this.extractLimitValue(sanitizedSQL);
        if (limit && limit > opts.maxRows) {
          errors.push(`LIMIT exceeds maximum allowed rows (${opts.maxRows})`);
        }
      }

      // Check for allowed tables if specified
      if (opts.allowedTables.length > 0) {
        const tables = this.extractTableNames(sanitizedSQL);
        const unauthorizedTables = tables.filter(table => !opts.allowedTables.includes(table));
        if (unauthorizedTables.length > 0) {
          errors.push(`Unauthorized tables: ${unauthorizedTables.join(', ')}`);
        }
      }

      // Check for potentially dangerous patterns
      const dangerousPatterns = this.checkDangerousPatterns(sanitizedSQL);
      if (dangerousPatterns.length > 0) {
        warnings.push(`Potentially dangerous patterns detected: ${dangerousPatterns.join(', ')}`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        sanitizedSQL: errors.length === 0 ? sanitizedSQL : undefined,
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [`SQL parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      };
    }
  }

  private sanitizeSQL(sql: string): string {
    // Remove comments
    let sanitized = sql.replace(/--.*$/gm, '');
    sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    return sanitized;
  }

  private checkForbiddenKeywords(sql: string, forbiddenKeywords: string[]): string[] {
    const upperSQL = sql.toUpperCase();
    const found: string[] = [];
    
    for (const keyword of forbiddenKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(sql)) {
        found.push(keyword);
      }
    }
    
    return found;
  }

  private isSelectStatement(sql: string): boolean {
    const upperSQL = sql.toUpperCase().trim();
    return upperSQL.startsWith('SELECT');
  }

  private hasLimitClause(sql: string): boolean {
    const upperSQL = sql.toUpperCase();
    return upperSQL.includes('LIMIT');
  }

  private extractLimitValue(sql: string): number | null {
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    return limitMatch ? parseInt(limitMatch[1], 10) : null;
  }

  private extractTableNames(sql: string): string[] {
    const tables: string[] = [];
    
    // Match FROM and JOIN clauses
    const fromMatches = sql.matchAll(/FROM\s+(\w+)/gi);
    const joinMatches = sql.matchAll(/JOIN\s+(\w+)/gi);
    
    for (const match of fromMatches) {
      tables.push(match[1]);
    }
    
    for (const match of joinMatches) {
      tables.push(match[1]);
    }
    
    return [...new Set(tables)]; // Remove duplicates
  }

  private checkDangerousPatterns(sql: string): string[] {
    const patterns: string[] = [];
    const upperSQL = sql.toUpperCase();
    
    // Check for subqueries (could be complex)
    if (upperSQL.includes('(SELECT')) {
      patterns.push('subqueries');
    }
    
    // Check for UNION (could be used to bypass restrictions)
    if (upperSQL.includes('UNION')) {
      patterns.push('UNION statements');
    }
    
    // Check for functions that might be dangerous
    const dangerousFunctions = ['EXEC', 'EVAL', 'LOAD_FILE'];
    for (const func of dangerousFunctions) {
      if (upperSQL.includes(func)) {
        patterns.push(`${func} function`);
      }
    }
    
    return patterns;
  }

  // Utility method to add LIMIT if missing
  addLimitIfMissing(sql: string, maxRows: number = 1000): string {
    const upperSQL = sql.toUpperCase();
    if (!upperSQL.includes('LIMIT')) {
      return `${sql.trim()} LIMIT ${maxRows}`;
    }
    return sql;
  }

  // Utility method to validate and sanitize for reports
  validateForReports(sql: string, tenantId: string): SQLValidationResult {
    const tenantTables = [
      'Contact', 'Donation', 'Campaign', 'GrantApp', 'Organization', 
      'Staff', 'PipelineEvent', 'FileAsset', 'Report'
    ];

    return this.validate(sql, {
      maxRows: 1000,
      timeoutMs: 30000,
      allowedTables: tenantTables,
      forbiddenKeywords: [
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'TRUNCATE',
        'GRANT', 'REVOKE', 'EXEC', 'EXECUTE', 'CALL', 'MERGE', 'UPSERT',
        'COPY', 'LOAD', 'IMPORT', 'EXPORT', 'BACKUP', 'RESTORE'
      ],
    });
  }
}

// Export singleton instance
export const sqlValidator = new SQLValidator();
