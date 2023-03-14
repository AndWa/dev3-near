import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
  })
  readonly name?: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
  })
  readonly slug?: string;

  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
  })
  readonly logo_id?: string;
}
