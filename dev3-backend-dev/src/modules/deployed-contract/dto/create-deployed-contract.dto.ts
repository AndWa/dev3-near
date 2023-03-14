import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import Mongoose from 'mongoose';
import { deployedContractNameRegex } from '../../../utils/regex';

export class CreateDeployedContractDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
  })
  @Matches(deployedContractNameRegex, {
    message: 'alias can contain only letters, numbers and dashes',
  })
  alias: string;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  contract_template_id: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  args: any;

  @IsNotEmpty()
  @ApiProperty({ type: String, required: true })
  project_id: string;

  owner: Mongoose.Types.ObjectId;
}
