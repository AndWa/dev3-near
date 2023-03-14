import { TransactionRequestType } from '../../../common/enums/transaction-request-type.enum';
import { TransactionRequestDto } from '../dto/transaction-request.dto';
import { TransactionRequest } from '../entities/transaction-request.entity';

export const mapTransactionRequestDto = (
  entity: TransactionRequest,
): TransactionRequestDto => {
  return {
    uuid: entity.uuid,
    created_at: entity.createdAt,
    status: entity.status,
    contractId: entity.contractId,
    method: entity.method,
    args: entity.args,
    meta: entity.meta,
    gas: entity.gas,
    deposit: entity.deposit,
    txHash: entity.txHash,
    txDetails: entity.txDetails,
    is_near_token: entity.is_near_token,
    caller_address: entity.caller_address,
    project_id: entity.project._id.toString(),
    type: entity.type as TransactionRequestType,
  };
};
