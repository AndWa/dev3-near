import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import Mongoose, { Document } from 'mongoose';
import { Project } from '../../../modules/project/entities/project.entity';
import { BaseEntity } from '../../../common/entities/base-entity';
import { User } from '../../../modules/user/entities/user.entity';
import { TransactionRequestStatus } from '../../../common/enums/transaction-request.enum';
import { TransactionRequestType } from '../../../common/enums/transaction-request-type.enum';

export type TransactionRequestDocument = TransactionRequest & Document;

@Schema({
  _id: true,
})
export class TransactionRequest extends BaseEntity {
  @ApiProperty({
    type: String,
  })
  @Prop({ required: true, unique: true })
  uuid: string;

  @ApiProperty({
    type: String,
    enum: [TransactionRequestType.Transaction, TransactionRequestType.Payment],
  })
  @Prop({
    required: true,
    enum: TransactionRequestType,
    default: TransactionRequestType.Transaction,
  })
  type: string;

  @ApiProperty({
    type: String,
    enum: [
      TransactionRequestStatus.Pending,
      TransactionRequestStatus.Success,
      TransactionRequestStatus.Failure,
    ],
  })
  @Prop({
    type: String,
    required: true,
    enum: TransactionRequestStatus,
    default: TransactionRequestStatus.Pending,
  })
  status: TransactionRequestStatus;

  @ApiProperty({
    type: String,
    required: false,
  })
  @Prop({ required: false })
  contractId?: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  method: string;

  @ApiProperty()
  @Prop({
    required: false,
    get: (meta: string) => {
      try {
        return JSON.parse(meta);
      } catch (err) {
        return meta;
      }
    },
    set: (meta: any) => {
      return JSON.stringify(meta);
    },
  })
  meta?: string;

  @ApiProperty()
  @Prop({
    required: false,
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
  args?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @Prop({ required: false })
  gas?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @Prop({ required: false })
  deposit?: string;

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
  caller_address?: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @Prop({ required: false, default: false })
  is_near_token: boolean;

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
}

export const TransactionRequestSchema =
  SchemaFactory.createForClass(TransactionRequest);
