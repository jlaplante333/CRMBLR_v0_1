import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class TenantGuard extends JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];
    
    if (!tenantId) {
      throw new BadRequestException('Missing tenant ID');
    }

    // Set tenant context for RLS
    // This would be done in a middleware or interceptor in a real implementation
    
    return user;
  }
}
