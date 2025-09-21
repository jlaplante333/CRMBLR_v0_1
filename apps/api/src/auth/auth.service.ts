import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { cognitoAuth } from '@crmblr/auth';
import { db } from '@crmblr/db';
import { JWTPayload } from '@crmblr/types';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(accessToken: string): Promise<JWTPayload | null> {
    return await cognitoAuth.verifyToken(accessToken);
  }

  async login(user: JWTPayload) {
    const payload = { 
      sub: user.sub, 
      email: user.email, 
      username: user['cognito:username'] 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.sub,
        email: user.email,
        username: user['cognito:username'],
      },
    };
  }

  async getUserTenants(userId: string) {
    // Set user context for RLS
    await db.setTenantContext('00000000-0000-0000-0000-000000000000', userId);
    
    const userTenants = await db.client.userTenant.findMany({
      where: { userId },
      include: {
        tenant: true,
      },
    });

    await db.clearTenantContext();
    
    return userTenants.map(ut => ({
      id: ut.tenant.id,
      name: ut.tenant.name,
      slug: ut.tenant.slug,
      role: ut.role,
      branding: ut.tenant.branding,
    }));
  }
}
