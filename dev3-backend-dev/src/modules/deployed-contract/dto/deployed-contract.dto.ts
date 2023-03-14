import { ApiProperty } from '@nestjs/swagger';
import { DeployedContractStatus } from '../../../common/enums/deployed-contract-status.enum';

export class DeployedContractDto {
  @ApiProperty({
    type: String,
  })
  uuid: string;

  @ApiProperty({
    type: String,
  })
  contract_template_name: string;

  @ApiProperty({
    type: String,
  })
  contract_template_description: string;

  @ApiProperty({
    type: String,
  })
  alias: string;

  @ApiProperty({
    type: String,
    isArray: true,
  })
  tags: string[];

  @ApiProperty({
    enum: [DeployedContractStatus.Pending, DeployedContractStatus.Deployed],
  })
  status: DeployedContractStatus;

  @ApiProperty()
  args: any;

  @ApiProperty({
    type: String,
    required: false,
  })
  deployer_address?: string;

  @ApiProperty({
    type: String,
  })
  txHash?: string;

  @ApiProperty({
    type: String,
  })
  txDetails?: string;

  @ApiProperty({
    type: String,
  })
  project_name: string;

  @ApiProperty({
    type: String,
  })
  project_logo_url: string;

  @ApiProperty({
    type: Date,
  })
  created_at: Date;

  @ApiProperty({
    type: Date,
  })
  updated_at: Date;
}
