import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, MinDate } from 'class-validator';

export class RegenerateApiKeyDto {
  @ApiProperty({
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  expires: Date;
}
