import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(username: string, password: string) {
    // Simplified auth - in production, validate against user database
    // For demo purposes, accept any login
    const payload = { username, sub: username, role: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
      user: { username, role: 'admin' },
    };
  }

  async validateUser(username: string): Promise<any> {
    // In production, fetch user from database
    return { username, role: 'admin' };
  }
}
