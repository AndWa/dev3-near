import { ApiProperty } from '@nestjs/swagger';

export class ProjectDto {
  @ApiProperty({
    type: String,
  })
  readonly id: string;

  @ApiProperty({
    type: String,
  })
  readonly name: string;

  @ApiProperty({
    type: String,
  })
  readonly slug?: string;

  @ApiProperty({
    type: String,
  })
  readonly logo_url?: string;
}
