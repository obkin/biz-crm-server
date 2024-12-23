import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { OrdersRepository } from './repositories/orders.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { UsersModule } from '../users/users.module';
import { ProductsModule } from '../products/products.module';
import { OrdersManagementController } from './controllers/orders-management.controller';
import { OrdersManagementService } from './services/orders-management.service';
import { OrdersManagementRepository } from './repositories/orders-management.repository';

@Module({
  controllers: [OrdersController, OrdersManagementController],
  providers: [
    OrdersService,
    OrdersRepository,
    OrdersManagementService,
    OrdersManagementRepository,
  ],
  imports: [
    TypeOrmModule.forFeature([OrderEntity]),
    UsersModule,
    ProductsModule,
  ],
  exports: [
    OrdersService,
    OrdersRepository,
    OrdersManagementService,
    OrdersManagementRepository,
  ],
})
export class OrdersModule {}
