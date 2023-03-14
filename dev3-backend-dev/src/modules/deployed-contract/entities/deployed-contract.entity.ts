import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import Mongoose, { Document } from 'mongoose';
import { Project } from '../../../modules/project/entities/project.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { BaseEntity } from '../../../common/entities/base-entity';
import { DeployedContractStatus } from '../../../common/enums/deployed-contract-status.enum';
import { Contract } from '../../../modules/contract/entities/contract.entity';

export type DeployedContractDocument = DeployedContract & Document;

@Schema({
  _id: true,
})
export class DeployedContract extends BaseEntity {
  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true, unique: true })
  uuid: string;

  @ApiProperty({
    type: String,
    required: true,
  })
  @Prop({ required: true })
  alias: string;

  @ApiProperty({ required: true })
  @Prop({
    required: true,
    get: (args: string) => {
      try {
        return JSON.parse(args);
      } catch (err) {
        return args;
      }
    },
    set: (args: any) => {
      return JSON.stringify(args);
    },
  })
  args: string;

  @ApiProperty({
    type: [String],
  })
  @Prop({ required: true })
  tags: string[];

  @ApiProperty({
    type: String,
    enum: [DeployedContractStatus.Pending, DeployedContractStatus.Deployed],
  })
  @Prop({
    type: String,
    required: true,
    enum: DeployedContractStatus,
    default: DeployedContractStatus.Pending,
  })
  status: DeployedContractStatus;

  @ApiProperty({
    type: String,
    required: false,
  })
  @Prop({ required: false })
  address?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @Prop({ required: false })
  txHash?: string;

  @ApiProperty({ required: false })
  @Prop({
    required: false,
    get: (txDetails: string) => {
      try {
        return JSON.parse(txDetails);
      } catch (err) {
        return txDetails;
      }
    },
    set: (txDetails: any) => {
      return JSON.stringify(txDetails);
    },
  })
  txDetails?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @Prop({ required: false })
  deployer_address?: string;

  @ApiProperty({
    type: User,
  })
  @Prop({ type: Mongoose.Types.ObjectId, ref: User.name })
  owner: User;

  @ApiProperty({
    type: Project,
  })
  @Prop({ type: Mongoose.Types.ObjectId, ref: Project.name })
  project: Project;

  @ApiProperty({
    type: Contract,
    required: false,
  })
  @Prop({ type: Mongoose.Types.ObjectId, ref: Contract.name, default: null })
  contract_template?: Contract;
}

export const DeployedContractSchema =
  SchemaFactory.createForClass(DeployedContract);

DeployedContractSchema.index({ owner: 1, alias: 1 }, { unique: true });
