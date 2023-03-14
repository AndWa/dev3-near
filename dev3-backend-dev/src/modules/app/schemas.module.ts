import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Address, AddressSchema } from '../address/entities/address.entity';
import { ApiKey, ApiKeySchema } from '../api-key/entities/api-key.entity';
import { Contract, ContractSchema } from '../contract/entities/contract.entity';
import { File, FileSchema } from '../file/entities/file.entity';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import {
  TransactionRequest,
  TransactionRequestSchema,
} from '../transaction-request/entities/transaction-request.entity';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Address.name, schema: AddressSchema }]),
    // MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
    ]),
    MongooseModule.forFeature([{ name: ApiKey.name, schema: ApiKeySchema }]),
    MongooseModule.forFeature([
      { name: TransactionRequest.name, schema: TransactionRequestSchema },
    ]),
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  exports: [MongooseModule],
})
export class MongooseSchemasModule {}
