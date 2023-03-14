import { ApiProperty } from '@nestjs/swagger';

export class PaginatedDto<TData> {
  @ApiProperty({
    type: Number,
  })
  total: number;

  @ApiProperty({
    type: Number,
  })
  limit: number;

  @ApiProperty({
    type: Number,
  })
  offset: number;

  @ApiProperty({
    type: Number,
  })
  count: number;

  @ApiProperty({
    type: 'array',
  })
  results: TData[];
}
