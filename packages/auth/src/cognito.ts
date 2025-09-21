import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { JWTPayload } from '@crmblr/types';

export class CognitoAuthService {
  private client: CognitoIdentityProviderClient;

  constructor() {
    this.client = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  async verifyToken(accessToken: string): Promise<JWTPayload | null> {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.client.send(command);
      
      // Extract user info from Cognito response
      const username = response.Username;
      const email = response.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
      
      if (!username || !email) {
        return null;
      }

      // Create a simplified JWT payload
      const payload: JWTPayload = {
        sub: username,
        email,
        'cognito:username': username,
        'cognito:groups': [],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      };

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  async getUserInfo(accessToken: string) {
    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.client.send(command);
      return response;
    } catch (error) {
      console.error('Get user info failed:', error);
      throw error;
    }
  }
}

export const cognitoAuth = new CognitoAuthService();
