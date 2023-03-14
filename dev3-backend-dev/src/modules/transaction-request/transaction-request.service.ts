import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Mongoose, { Model } from 'mongoose';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { TransactionRequestStatus } from '../../common/enums/transaction-request.enum';
import {
  BadRequest,
  NotFound,
  ServerError,
  Unauthorized,
} from '../../helpers/response/errors';
import { ServiceResult } from '../../helpers/response/result';
import { Project, ProjectDocument } from '../project/entities/project.entity';
import { CreateTransactionRequestDto } from './dto/create-transaction-request.dto';
import {
  TransactionRequest,
  TransactionRequestDocument,
} from './entities/transaction-request.entity';
import { UpdateTransactionRequestDto } from './dto/update-transaction-request.dto';
import { TransactionRequestDto } from './dto/transaction-request.dto';
import { PublicTransactionRequestDto } from './dto/public-transaction-request.dto';
import { mapTransactionRequestDto } from './mappers/mapTransactionRequestDto';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { getState } from '../../helpers/rpc/rpc-helper';
import { TransactionRequestType } from '../../common/enums/transaction-request-type.enum';
import { isValidEnum } from '../../helpers/enum/enum.helper';
import { mapPublicTransactionRequestDto } from './mappers/mapPublicTransactionRequestDto';

@Injectable()
export class TransactionRequestService {
  private readonly logger = new Logger(TransactionRequestService.name);

  constructor(
    @InjectModel(TransactionRequest.name)
    private transactionRequestRepo: Model<TransactionRequestDocument>,
    @InjectModel(Project.name) private projectRepo: Model<ProjectDocument>,
    private configService: ConfigService,
  ) {}

  async create(
    dto: CreateTransactionRequestDto,
  ): Promise<ServiceResult<TransactionRequest>> {
    try {
      if (!dto.project_id) {
        return new BadRequest<TransactionRequest>(`project_id can't be empty`);
      }

      if (!dto.contractId) {
        return new BadRequest<TransactionRequest>(`ContractId can't be empty`);
      }

      if (!dto.method) {
        return new BadRequest<TransactionRequest>(`Method can't be empty`);
      }

      if (!isValidEnum(TransactionRequestType, dto.type)) {
        return new BadRequest<TransactionRequest>(
          `Not valid transaction request type`,
        );
      }

      if (!Mongoose.Types.ObjectId.isValid(dto.project_id)) {
        return new NotFound<TransactionRequest>('Project not found');
      }

      const project = await this.projectRepo
        .findOne({ _id: new Mongoose.Types.ObjectId(dto.project_id) })
        .exec();

      if (!project) {
        return new NotFound<TransactionRequest>('Project not found');
      }

      if (project.owner._id.toString() !== dto.owner.toString()) {
        return new Unauthorized<TransactionRequest>(
          'Unauthorized access to user project',
        );
      }

      dto.project = new Mongoose.Types.ObjectId(dto.project_id);
      dto.uuid = uuidv4();
      const transactionRequest = await new this.transactionRequestRepo(
        dto,
      ).save();

      return new ServiceResult<TransactionRequest>(transactionRequest);
    } catch (error) {
      this.logger.error('TransactionRequestService - create', error);
      return new ServerError<TransactionRequest>(
        `Can't create transaction request`,
      );
    }
  }

  async findAll(
    ownerId: Mongoose.Types.ObjectId,
    offset?: number,
    limit?: number,
    project_id?: string,
    contractId?: string,
    method?: string,
    status?: TransactionRequestStatus,
    type?: TransactionRequestType,
  ): Promise<ServiceResult<PaginatedDto<TransactionRequest>>> {
    try {
      const paginatedAggregate: any[] = [];
      const queryAnd: any = {
        $and: [],
      };

      queryAnd.$and.push({ owner: ownerId });

      if (project_id) {
        queryAnd.$and.push({
          project: new Mongoose.Types.ObjectId(project_id),
        });
      }

      if (contractId) {
        queryAnd.$and.push({
          contractId: { $regex: contractId, $options: 'i' },
        });
      }

      if (method) {
        queryAnd.$and.push({
          method: { $regex: method, $options: 'i' },
        });
      }

      if (status) {
        queryAnd.$and.push({
          status: { $regex: status, $options: 'i' },
        });
      }

      if (type) {
        queryAnd.$and.push({ type: { $regex: type, $options: 'i' } });
      }

      paginatedAggregate.push({ $match: queryAnd });

      if (offset) {
        paginatedAggregate.push({ $skip: Number(offset) });
      }

      if (limit) {
        paginatedAggregate.push({ $limit: Number(limit) });
      }

      const [{ paginatedResult, totalCount }] =
        await this.transactionRequestRepo
          .aggregate([
            {
              $facet: {
                paginatedResult: paginatedAggregate,
                totalCount: [{ $match: queryAnd }, { $count: 'count' }],
              },
            },
          ])
          .exec();

      return new ServiceResult<PaginatedDto<TransactionRequest>>({
        total: totalCount.length > 0 ? totalCount[0].count : 0,
        count: paginatedResult.length,
        offset: offset ? Number(offset) : 0,
        limit: limit ? Number(limit) : 0,
        results: paginatedResult,
      });
    } catch (error) {
      this.logger.error('TransactionRequestService - findAll', error);
      return new ServerError<PaginatedDto<TransactionRequest>>(
        `Can't get transaction requests`,
      );
    }
  }

  async findByUuid(
    uuid: string,
  ): Promise<ServiceResult<PublicTransactionRequestDto>> {
    try {
      const transactionRequest = await this.transactionRequestRepo
        .findOne({ uuid })
        .exec();

      if (!transactionRequest) {
        return new NotFound<PublicTransactionRequestDto>(
          'Transaction request not found',
        );
      }

      if (
        transactionRequest.txHash &&
        transactionRequest.status === TransactionRequestStatus.Pending
      ) {
        await this.updateTxStatus(
          transactionRequest.txHash,
          transactionRequest.caller_address,
          transactionRequest.uuid,
        );
      }

      return new ServiceResult<PublicTransactionRequestDto>(
        mapPublicTransactionRequestDto(
          await this.transactionRequestRepo
            .findOne({ uuid })
            .populate({
              path: 'project',
              populate: { path: 'logo', model: 'File' },
            })
            .exec(),
        ),
      );
    } catch (error) {
      this.logger.error('TransactionRequestService - findByUUid', error);
      return new ServerError<PublicTransactionRequestDto>(
        `Can't get transaction request`,
      );
    }
  }

  async findOne(
    id: string,
    ownerId: string,
  ): Promise<ServiceResult<TransactionRequest>> {
    try {
      if (!Mongoose.Types.ObjectId.isValid(id)) {
        return new NotFound<TransactionRequest>(
          'Transaction request not found',
        );
      }

      const transactionRequest = await this.transactionRequestRepo
        .findOne({ _id: id })
        .populate('owner')
        .exec();

      if (!transactionRequest) {
        return new NotFound<TransactionRequest>(
          'Transaction request not found',
        );
      }

      if (transactionRequest.owner._id.toString() !== ownerId) {
        return new Unauthorized<TransactionRequest>(
          'Unauthorized access to user transaction request',
        );
      }

      if (
        transactionRequest.txHash &&
        transactionRequest.status === TransactionRequestStatus.Pending
      ) {
        await this.updateTxStatus(
          transactionRequest.txHash,
          transactionRequest.caller_address,
          transactionRequest.uuid,
        );
      }
      return new ServiceResult<TransactionRequest>(
        await this.transactionRequestRepo
          .findOne({ _id: id })
          .populate('owner')
          .exec(),
      );
    } catch (error) {
      this.logger.error('TransactionRequestService - findOne', error);
      return new ServerError<TransactionRequest>(
        `Can't get transaction request`,
      );
    }
  }

  async update(
    uuid: string,
    dto: UpdateTransactionRequestDto,
  ): Promise<ServiceResult<TransactionRequestDto>> {
    try {
      const updateTransactionRequest = await this.transactionRequestRepo
        .findOne({ uuid })
        .exec();

      if (!updateTransactionRequest) {
        return new NotFound<TransactionRequestDto>(
          'Transaction request not found',
        );
      }

      if (updateTransactionRequest.txHash) {
        return new BadRequest<TransactionRequestDto>(
          'Transaction request already confirmed',
        );
      }

      if (dto.type && !isValidEnum(TransactionRequestType, dto.type)) {
        return new BadRequest<TransactionRequestDto>(
          `Not valid transaction request type`,
        );
      }

      if (dto.type) {
        updateTransactionRequest.type = dto.type;
      }

      updateTransactionRequest.txHash = dto.txHash;
      updateTransactionRequest.txDetails = dto.txDetails;
      updateTransactionRequest.caller_address = dto.caller_address;
      updateTransactionRequest.updatedAt = new Date();

      await this.transactionRequestRepo.updateOne(
        { uuid },
        updateTransactionRequest,
      );

      const updatedTransactionRequest = await this.transactionRequestRepo
        .findOne({ uuid })
        .exec();

      return new ServiceResult<TransactionRequestDto>(
        mapTransactionRequestDto(updatedTransactionRequest),
      );
    } catch (error) {
      this.logger.error('TransactionRequestService - update', error);
      return new ServerError<TransactionRequestDto>(
        `Can't update transaction request`,
      );
    }
  }

  async updateAllTxStatuses(): Promise<void> {
    try {
      const transactionRequests = await this.transactionRequestRepo
        .find({ status: TransactionRequestStatus.Pending })
        .exec();

      for (const transactionRequest of transactionRequests) {
        if (transactionRequest.txHash && transactionRequest.caller_address) {
          await this.updateTxStatus(
            transactionRequest.txHash,
            transactionRequest.caller_address,
            transactionRequest.uuid,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'TransactionRequestService - updateAllTxStatuses',
        error,
      );
    }
  }

  async updateTxStatus(
    txHash: string,
    caller_address: string,
    uuid: string,
  ): Promise<void> {
    try {
      const txState = await getState(
        txHash,
        caller_address,
        this.configService.get('NODE_ENV'),
      );
      await this.transactionRequestRepo.updateOne(
        { uuid },
        {
          status: txState.status.hasOwnProperty('SuccessValue')
            ? TransactionRequestStatus.Success
            : TransactionRequestStatus.Failure,
        },
      );
    } catch (error) {
      this.logger.error('TransactionRequestService - updateTxStatus', error);
    }
  }
}
