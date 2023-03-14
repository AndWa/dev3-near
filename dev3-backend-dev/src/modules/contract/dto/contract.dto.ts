import { ApiProperty } from '@nestjs/swagger';

export class ContractDto {
  @ApiProperty({
    type: String,
  })
  readonly _id?: string;

  @ApiProperty({
    type: String,
  })
  readonly name: string;

  @ApiProperty({
    type: String,
  })
  readonly description: string;

  @ApiProperty({
    type: Boolean,
  })
  readonly is_audited: boolean;

  @ApiProperty({
    type: [String],
  })
  readonly tags: string[];

  @ApiProperty({
    type: String,
  })
  readonly creator_name: string;

  @ApiProperty({
    type: String,
  })
  readonly github_url: string;

  @ApiProperty({
    type: String,
  })
  readonly info_markdown_url: string;
}
