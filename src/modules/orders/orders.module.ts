import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
  imports: [TypeOrmModule.forFeature([OrderEntity]), UsersModule],
  exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
