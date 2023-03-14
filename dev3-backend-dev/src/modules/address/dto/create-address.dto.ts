import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  Matches,
} from 'class-validator';
import Mongoose from 'mongoose';
import { nearWalletRegex } from '../../../utils/regex';

export class CreateAddressDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @Matches(nearWalletRegex, {
    message: 'wallet must be named or implicit near wallet',
  })
  wallet: string;
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: false,
  })
  alias: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
  })
  email?: string;
  @IsPhoneNumber()
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    nullable: true,
  })
  phone?: string;

  owner: Mongoose.Types.ObjectId;
}
