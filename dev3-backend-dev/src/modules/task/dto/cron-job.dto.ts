import { ApiProperty } from '@nestjs/swagger';

export class CronJobDto {
  @ApiProperty({
    type: String,
  })
  name: string;
  @ApiProperty({
    type: Date,
  })
  nextRun: Date;

  @ApiProperty({
    type: Boolean,
  })
  isRunning: boolean;
}
