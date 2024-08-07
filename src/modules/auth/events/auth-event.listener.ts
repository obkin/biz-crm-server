import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthEventListener {
  constructor(private readonly authService: AuthService) {}

  @OnEvent('auth.userLogout')
  async handleUserLogout(payload: { userId: number }) {
    const { userId } = payload;
    this.authService.userLogout(userId);
  }
}
