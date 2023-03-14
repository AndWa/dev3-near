import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Contract, ContractSchema } from '../contract/entities/contract.entity';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import { DeployedContractService } from './deployed-contract.service';
import { DeployedContractController } from './deployed-contract.controller';
import {
  DeployedContract,
  DeployedContractSchema,
} from './entities/deployed-contract.entity';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: DeployedContract.name, schema: DeployedContractSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Contract.name, schema: ContractSchema },
    ]),
  ],
  controllers: [DeployedContractController],
  providers: [DeployedContractService],
  exports: [DeployedContractService],
})
export class DeployedContractModule {}
