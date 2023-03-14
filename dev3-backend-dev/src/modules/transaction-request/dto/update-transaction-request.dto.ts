import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { TransactionRequestType } from '../../../common/enums/transaction-request-type.enum';

export class UpdateTransactionRequestDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly txHash: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly caller_address: string;

  @IsOptional()
  @ApiProperty({ required: false })
  readonly txDetails?: any;

  @IsOptional()
  @ApiProperty({
    type: String,
    required: false,
    enum: TransactionRequestType,
  })
  readonly type?: TransactionRequestType;
}
