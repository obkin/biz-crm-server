import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserEventListener {
  @OnEvent('user.deleted')
  userLogout(payload: { userId: number }) {
    const { userId } = payload;
    console.log(`User with ID ${userId} has been deleted.`);
    // this.authService.userLogout(userId);
  }
}
