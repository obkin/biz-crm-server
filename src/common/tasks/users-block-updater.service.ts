// import { Injectable } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
// import { UsersManagementService } from './users-management.service';

// @Injectable()
// export class BlockStatusUpdaterService {
//   constructor(
//     private readonly usersManagementService: UsersManagementService,
//   ) {}

//   @Cron('0 0 * * *') // Запуск щодня опівночі
//   async handleCron() {
//     await this.usersManagementService.updateInactiveBlocks();
//   }
// }
