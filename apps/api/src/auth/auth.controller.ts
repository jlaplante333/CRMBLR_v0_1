import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with Cognito token' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.accessToken);
    if (!user) {
      throw new Error('Invalid token');
    }
    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({ status: 200, description: 'User info retrieved' })
  async getProfile(@Request() req) {
    return {
      id: req.user.sub,
      email: req.user.email,
      username: req.user['cognito:username'],
    };
  }

  @Get('tenants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user tenants' })
  @ApiResponse({ status: 200, description: 'User tenants retrieved' })
  async getUserTenants(@Request() req) {
    return this.authService.getUserTenants(req.user.sub);
  }
}
