import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://obkin:2tv0CIDT3nlPfzEQ@biz-crm-cluster.rtl5mta.mongodb.net/',
    ),
  ],
})
export class DatabaseModule {}
