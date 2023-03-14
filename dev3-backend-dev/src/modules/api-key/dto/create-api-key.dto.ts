import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MinDate } from 'class-validator';
import Mongoose from 'mongoose';

export class CreateApiKeyDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  @IsNotEmpty()
  project_id: string;

  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  expires: Date;
  // 7 days
  // 30 days
  // 60 days
  // 90 days
  // Custom date
  // No expiration let maxDate = new Date(8640000000000000);

  owner: Mongoose.Types.ObjectId;
}
