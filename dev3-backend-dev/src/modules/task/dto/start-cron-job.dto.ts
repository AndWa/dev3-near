import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StartCronJobDto {
  @IsNotEmpty()
  @ApiProperty({
    type: Boolean,
  })
  start: boolean;
}
