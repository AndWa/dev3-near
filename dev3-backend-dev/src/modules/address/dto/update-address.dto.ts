import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateAddressDto {
  @IsEmail()
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
  })
  email?: string;
  @IsPhoneNumber()
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
  })
  phone?: string;
}
