import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import Mongoose from 'mongoose';

export class CreateProjectDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
  })
  readonly name: string;

  @ApiProperty({
    type: String,
  })
  readonly slug?: string;

  @ApiProperty({
    type: String,
  })
  readonly logo_id?: string;

  owner: Mongoose.Types.ObjectId;
}
