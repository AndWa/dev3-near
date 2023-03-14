import { ApiProperty } from '@nestjs/swagger';

export class NearLoginRequestDto {
  @ApiProperty({
    type: String,
  })
  username: string;
  @ApiProperty({
    type: String,
  })
  signedJsonString: string;
}
