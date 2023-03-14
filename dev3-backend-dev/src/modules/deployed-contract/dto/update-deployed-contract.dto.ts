import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateDeployedContractDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly txHash: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly deployer_address: string;

  @IsOptional()
  @ApiProperty({ required: false })
  readonly txDetails?: any;
}
