import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import Mongoose, { Document } from 'mongoose';
import { emailRegex, nearWalletRegex } from '../../../utils/regex';
import { BaseEntity } from '../../../common/entities/base-entity';
import { User } from '../../../modules/user/entities/user.entity';

export type AddressDocument = Address & Document;

@Schema({
  _id: true,
  autoIndex: true,
})
export class Address extends BaseEntity {
  @ApiProperty({
    type: String,
  })
  @Prop({ required: true, match: nearWalletRegex })
  wallet: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  alias: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: false, default: null })
  phone?: string;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: false, match: emailRegex, default: null })
  email?: string;

  @ApiProperty({
    type: User,
  })
  @Prop({ type: Mongoose.Types.ObjectId, ref: User.name })
  owner: User;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

AddressSchema.index({ owner: 1, alias: 1 }, { unique: true });
AddressSchema.index({ owner: 1, wallet: 1 }, { unique: true });
