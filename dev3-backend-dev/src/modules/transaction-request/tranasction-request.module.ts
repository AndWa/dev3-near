import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  TransactionRequest,
  TransactionRequestSchema,
} from './entities/transaction-request.entity';
import { TransactionRequestController } from './transaction-request.controller';
import { TransactionRequestService } from './transaction-request.service';
import { Project, ProjectSchema } from '../project/entities/project.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: TransactionRequest.name, schema: TransactionRequestSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [TransactionRequestController],
  providers: [TransactionRequestService],
  exports: [TransactionRequestService],
})
export class TransactionRequestModule {}
