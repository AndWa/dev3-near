import { ApiProperty } from '@nestjs/swagger';

export class SetCronTimeDto {
  @ApiProperty({
    type: String,
    required: true,
  })
  cronTime: string;
}
