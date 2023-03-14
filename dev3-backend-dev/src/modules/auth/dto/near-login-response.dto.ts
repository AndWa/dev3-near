import { ApiProperty } from '@nestjs/swagger';

export class NearLoginResponseDto {
  @ApiProperty({
    type: String,
  })
  token: string;
}
