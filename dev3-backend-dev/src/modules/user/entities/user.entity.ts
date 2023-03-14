import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base-entity';
import { Role } from '../../../common/enums/role.enum';

export type UserDocument = User & Document;

export type AuthRequest = Request & { user: User };

@Schema()
export class User extends BaseEntity {
  @ApiProperty({
    type: Boolean,
  })
  @Prop({ default: false })
  isCensored: boolean;

  @ApiProperty({
    type: Boolean,
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true, unique: true })
  uid: string; // NEAR accountId (e.g. test.near)

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true })
  accountType: string; // 'near'

  @ApiProperty({
    type: [String],
  })
  @Prop({ type: [String], required: true, default: [Role.Customer] })
  roles: string[]; // 'customer' or 'admin'.

  @ApiProperty({
    type: String,
  })
  @Prop({ required: true, unique: true })
  username: string; // NEAR accountId (e.g. test.near)

  @ApiProperty({
    type: String,
  })
  @Prop({ default: null })
  nearWalletAccountId: string; // NEAR accountId (e.g. test.near)
}

export const UserSchema = SchemaFactory.createForClass(User);
