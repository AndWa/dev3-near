import { ApiProperty } from '@nestjs/swagger';
import { TransactionRequestType } from '../../../common/enums/transaction-request-type.enum';
import { TransactionRequestStatus } from '../../../common/enums/transaction-request.enum';

export class TransactionRequestDto {
  @ApiProperty({
    type: String,
  })
  uuid: string;

  @ApiProperty({
    type: String,
    required: true,
    enum: TransactionRequestType,
  })
  readonly type: TransactionRequestType;

  @ApiProperty({
    type: Date,
  })
  created_at: Date;

  @ApiProperty({
    enum: [
      TransactionRequestStatus.Pending,
      TransactionRequestStatus.Success,
      TransactionRequestStatus.Failure,
    ],
  })
  status: TransactionRequestStatus;

  @ApiProperty({
    type: String,
    required: false,
  })
  contractId?: string;

  @ApiProperty({
    type: String,
  })
  method: string;

  @ApiProperty({ required: false })
  args?: any;

  @ApiProperty({ required: false })
  meta?: any;

  @ApiProperty({
    type: String,
    required: false,
  })
  gas?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  deposit?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  caller_address?: string;

  @ApiProperty({
    type: String,
  })
  txHash: string;

  @ApiProperty({
    type: String,
  })
  txDetails: string;

  @ApiProperty({
    type: Boolean,
  })
  is_near_token: boolean;

  @ApiProperty({
    type: String,
  })
  project_id: string;
}
