import { ApiProperty } from '@nestjs/swagger';

export class RevokeApiKeyDto {
  @ApiProperty({
    type: Boolean,
    required: true,
  })
  is_revoked: boolean;
}
