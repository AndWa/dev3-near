import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import {
  mockCreateTransactionRequestDtos,
  mockPublicTransactionRequestDto,
  mockTransactionRequest1,
  mockTransactionRequestDto,
  mockTransactionRequests,
  mockUser,
} from '../../../test/mock-tests-data';
import { ServiceResult } from '../../helpers/response/result';
import { Project } from '../project/entities/project.entity';
import { TransactionRequest } from './entities/transaction-request.entity';
import { TransactionRequestController } from './transaction-request.controller';
import { TransactionRequestService } from './transaction-request.service';
import { TransactionRequestDto } from './dto/transaction-request.dto';
import { ConfigService } from '@nestjs/config';
import { TransactionRequestType } from '../../common/enums/transaction-request-type.enum';
import { PublicTransactionRequestDto } from './dto/public-transaction-request.dto';

describe('TransactionRequestController', () => {
  let transactionRequestController: TransactionRequestController;
  let transactionRequestService: TransactionRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRequestController,
        TransactionRequestService,
        {
          provide: getModelToken(TransactionRequest.name),
          useValue: jest.fn(),
        },
        { provide: getModelToken(Project.name), useValue: jest.fn() },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'NODE_ENV') {
                return 'dev';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    transactionRequestService = module.get<TransactionRequestService>(
      TransactionRequestService,
    );
    transactionRequestController = module.get<TransactionRequestController>(
      TransactionRequestController,
    );
  });

  describe('create', () => {
    it('should create one address', async () => {
      const result = new ServiceResult<TransactionRequest>(
        mockTransactionRequest1,
      );
      jest.spyOn(transactionRequestService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await transactionRequestController.create(
        req,
        mockCreateTransactionRequestDtos[0],
      );
      expect(response).toBe(result.data);
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      const result = new ServiceResult<PaginatedDto<TransactionRequest>>({
        total: 4,
        count: 4,
        limit: 0,
        offset: 0,
        results: mockTransactionRequests,
      });
      jest
        .spyOn(transactionRequestService, 'findAll')
        .mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await transactionRequestController.findAll(req);
      expect(response).toBe(result.data);
    });
  });

  describe('findByUuid', () => {
    it('should find one transaction request by uuid', async () => {
      const result = new ServiceResult<PublicTransactionRequestDto>(
        mockPublicTransactionRequestDto,
      );
      jest
        .spyOn(transactionRequestService, 'findByUuid')
        .mockResolvedValue(result);
      const response = await transactionRequestController.findByUuid(
        mockTransactionRequestDto.uuid,
      );
      expect(response).toBe(result.data);
    });
  });

  describe('update', () => {
    it('should update one address', async () => {
      const transactionRequest: any = {
        ...mockTransactionRequests[0],
      };
      transactionRequest.txHash = '123';
      transactionRequest.receiptId = '222';
      transactionRequest.txDetails = {
        name: 'dule',
        base: '123',
      };
      transactionRequest.type = TransactionRequestType.Payment;

      const result = new ServiceResult<TransactionRequestDto>(
        transactionRequest,
      );
      jest.spyOn(transactionRequestService, 'update').mockResolvedValue(result);

      const response = await transactionRequestController.update(
        transactionRequest.uuid.toString(),
        {
          txHash: '123',
          txDetails: {
            name: 'dule',
            base: '123',
          },
          caller_address: 'bob.testnet',
        },
      );
      expect(response.txHash).toBe(transactionRequest.txHash);
    });
  });
});
