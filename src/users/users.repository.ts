import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository {
  async createNewUser() {
    try {
      // ...
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message);
      }
    }
  }
}
