import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserSchema } from '../user/entities/user.entity';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Mongoose, { connect, Connection, Model } from 'mongoose';

import {
  TransactionRequest,
  TransactionRequestSchema,
} from './entities/transaction-request.entity';
import { TransactionRequestService } from './transaction-request.service';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import {
  mockCreateTransactionRequestDtos,
  mockFile1,
  mockProjects,
  mockTransactionRequests,
  mockUser,
} from '../../../test/mock-tests-data';
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from '../../helpers/response/errors';
import { TransactionRequestDto } from './dto/transaction-request.dto';
import { ConfigService } from '@nestjs/config';
import { TransactionRequestType } from '../../common/enums/transaction-request-type.enum';
import { File, FileSchema } from '../file/entities/file.entity';

describe('TransactionRequestService', () => {
  let transactionRequestService: TransactionRequestService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let projectModel: Model<Project>;
  let userModel: Model<User>;
  let transactionRequestModel: Model<TransactionRequest>;
  let fileModel: Model<File>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    projectModel = mongoConnection.model(Project.name, ProjectSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    fileModel = mongoConnection.model(File.name, FileSchema);
    transactionRequestModel = mongoConnection.model(
      TransactionRequest.name,
      TransactionRequestSchema,
    );
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionRequestService,
        { provide: getModelToken(Project.name), useValue: projectModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(File.name), useValue: fileModel },
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
        {
          provide: getModelToken(TransactionRequest.name),
          useValue: transactionRequestModel,
        },
      ],
    }).compile();

    transactionRequestService = module.get<TransactionRequestService>(
      TransactionRequestService,
    );
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it('Create - should return the saved object', async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const createdTransactionRequest = await transactionRequestService.create(
      mockCreateTransactionRequestDtos[0],
    );

    expect(createdTransactionRequest.data.contractId).toBe(
      mockCreateTransactionRequestDtos[0].contractId,
    );
    expect(createdTransactionRequest.data.uuid).toBeDefined();
    expect(createdTransactionRequest.data.type).toBe(
      TransactionRequestType.Transaction,
    );
    expect(createdTransactionRequest.data.meta).toBe(
      mockCreateTransactionRequestDtos[0].meta,
    );
  });

  it(`Create - should return Not valid transaction request type (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto: any = { ...mockCreateTransactionRequestDtos[0] };
    dto.type = 'Test';
    const response = await transactionRequestService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<TransactionRequest>(`Not valid transaction request type`),
    );
  });

  it(`Create - should return project_id can't be empty (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateTransactionRequestDtos[0] };
    delete dto.project_id;
    const response = await transactionRequestService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<TransactionRequest>(`project_id can't be empty`),
    );
  });

  it(`Create - should return contractId can't be empty (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateTransactionRequestDtos[0] };
    delete dto.contractId;
    const response = await transactionRequestService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<TransactionRequest>(`ContractId can't be empty`),
    );
  });

  it(`Create - should return method can't be empty (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateTransactionRequestDtos[0] };
    delete dto.method;
    const response = await transactionRequestService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<TransactionRequest>(`Method can't be empty`),
    );
  });

  it(`Create - should return Project not found (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateTransactionRequestDtos[0] };
    dto.project_id = '613ff1e4bb85ed5475a1ff5d';
    const response = await transactionRequestService.create(dto);
    expect(response).toStrictEqual(
      new NotFound<TransactionRequest>('Project not found'),
    );
  });

  it(`Create - should return Unauthorized access to user project (Unauthorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateTransactionRequestDtos[0] };
    dto.owner = new Mongoose.Types.ObjectId('613ff1e4bb85ed5475a1ff5d');
    const response = await transactionRequestService.create(dto);
    expect(response).toStrictEqual(
      new Unauthorized<TransactionRequest>(
        'Unauthorized access to user project',
      ),
    );
  });

  it(`FindAll - should findAll`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await transactionRequestService.create(mockCreateTransactionRequestDtos[0]);
    await transactionRequestService.create(mockCreateTransactionRequestDtos[1]);
    const result = await transactionRequestService.findAll(mockUser._id);
    expect(result.data.results).toHaveLength(1);
    expect(result.data.count).toBe(1);
  });

  it(`FindAll - should findAll by contractId`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new projectModel(mockProjects[1]).save();
    await transactionRequestService.create(mockCreateTransactionRequestDtos[0]);
    await transactionRequestService.create(mockCreateTransactionRequestDtos[1]);

    const result = await transactionRequestService.findAll(
      mockUser._id,
      null,
      null,
      null,
      '123',
      null,
      null,
    );
    expect(result.data.results).toHaveLength(2);
    expect(result.data.count).toBe(2);
  });

  it(`FindAll - should findAll by method name`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new projectModel(mockProjects[1]).save();
    await transactionRequestService.create(mockCreateTransactionRequestDtos[0]);
    await transactionRequestService.create(mockCreateTransactionRequestDtos[1]);

    const result = await transactionRequestService.findAll(
      mockUser._id,
      null,
      null,
      mockProjects[0]._id.toString(),
      null,
      mockCreateTransactionRequestDtos[0].method,
    );

    expect(result.data.results).toHaveLength(1);
    expect(result.data.results[0].method).toBe(
      mockCreateTransactionRequestDtos[0].method,
    );
  });

  it(`FindAll - should findAll by type`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new projectModel(mockProjects[1]).save();
    await transactionRequestService.create(mockCreateTransactionRequestDtos[0]);
    await transactionRequestService.create(mockCreateTransactionRequestDtos[4]);

    const result = await transactionRequestService.findAll(
      mockUser._id,
      null,
      null,
      mockProjects[0]._id.toString(),
      null,
      null,
      null,
      TransactionRequestType.Transaction,
    );

    expect(result.data.results).toHaveLength(2);
    expect(result.data.results[0].type).toBe(
      TransactionRequestType.Transaction,
    );
    expect(result.data.results[1].type).toBe(
      TransactionRequestType.Transaction,
    );
  });

  it(`FindByUuid - should find by uuid`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new fileModel(mockFile1).save();
    const res = await transactionRequestService.create(
      mockCreateTransactionRequestDtos[0],
    );

    const result = await transactionRequestService.findByUuid(res.data.uuid);

    expect(result.data.uuid).toBe(res.data.uuid);
    expect(result.data.project.name).toBe(mockProjects[0].name);
    expect(result.data.project.logo_url).toBe(mockProjects[0].logo.url);
  });

  it(`FindOne - should findOne`, async () => {
    await new userModel(mockUser).save();
    const createResult = await new transactionRequestModel(
      mockTransactionRequests[0],
    ).save();
    const result = await transactionRequestService.findOne(
      createResult._id.toString(),
      mockUser._id.toString(),
    );
    expect(result.data._id.toString()).toBe(
      mockTransactionRequests[0]._id.toString(),
    );
  });

  it(`FindOne - should return Transaction request not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new transactionRequestModel(mockTransactionRequests[0]).save();
    const response = await transactionRequestService.findOne(
      '12',
      mockUser._id.toString(),
    );
    expect(response).toStrictEqual(
      new NotFound<TransactionRequest>('Transaction request not found'),
    );
  });

  it(`FindOne - should return Transaction request not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new transactionRequestModel(mockTransactionRequests[0]).save();
    const response = await transactionRequestService.findOne(
      '634ff1e4bb85ed5475a1ff6d',
      mockUser._id.toString(),
    );
    expect(response).toStrictEqual(
      new NotFound<TransactionRequest>('Transaction request not found'),
    );
  });

  it(`FindOne - should return Unauthorized access to user address (Unauthorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const createResult = await new transactionRequestModel(
      mockTransactionRequests[0],
    ).save();
    const response = await transactionRequestService.findOne(
      createResult._id.toString(),
      '123',
    );

    expect(response).toStrictEqual(
      new Unauthorized<TransactionRequest>(
        'Unauthorized access to user transaction request',
      ),
    );
  });

  it(`Update - should update`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const createResult = await new transactionRequestModel(
      mockTransactionRequests[0],
    ).save();

    const updateDto = {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      caller_address: 'bob.testnet',
    };
    const result = await transactionRequestService.update(
      createResult.uuid,
      updateDto,
    );

    expect(result.data.txHash).toBe(updateDto.txHash);
    expect(result.data.txDetails).toBeDefined();
    expect(result.data.caller_address).toBe(updateDto.caller_address);
    expect(result.data.type).toBe(createResult.type);
  });

  it(`Update - should update with different type`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const createResult = await new transactionRequestModel(
      mockTransactionRequests[0],
    ).save();

    const updateDto = {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      caller_address: 'bob.testnet',
      type: TransactionRequestType.Payment,
    };
    const result = await transactionRequestService.update(
      createResult.uuid,
      updateDto,
    );

    expect(result.data.txHash).toBe(updateDto.txHash);
    expect(result.data.txDetails).toBeDefined();
    expect(result.data.caller_address).toBe(updateDto.caller_address);
    expect(result.data.type).toBe(updateDto.type);
  });

  it(`Update - should return Not valid transaction request type (Bad request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const createResult = await new transactionRequestModel(
      mockTransactionRequests[0],
    ).save();

    const updateDto: any = {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      caller_address: 'bob.testnet',
      type: 'Test',
    };
    const result = await transactionRequestService.update(
      createResult.uuid,
      updateDto,
    );

    expect(result).toStrictEqual(
      new BadRequest<TransactionRequestDto>(
        'Not valid transaction request type',
      ),
    );
  });

  it(`Update - should return Transaction request already confirmed (Bad request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const createResult = await new transactionRequestModel(
      mockTransactionRequests[0],
    ).save();
    await transactionRequestService.update(createResult.uuid, {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      caller_address: 'bob.testnet',
    });

    const result = await transactionRequestService.update(createResult.uuid, {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      caller_address: 'bob.testnet',
    });
    expect(result).toStrictEqual(
      new BadRequest<TransactionRequestDto>(
        'Transaction request already confirmed',
      ),
    );
  });

  it(`Update - should return Transaction request not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new transactionRequestModel(mockTransactionRequests[0]).save();
    const response = await transactionRequestService.update('12', {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      caller_address: 'bob.testnet',
    });
    expect(response).toStrictEqual(
      new NotFound<TransactionRequestDto>('Transaction request not found'),
    );
  });

  it(`Update - should return Transaction request not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new transactionRequestModel(mockTransactionRequests[0]).save();
    const response = await transactionRequestService.update(
      '634ff1e4bb85ed5475a1ff6d',
      {
        txHash: '123',
        txDetails: {
          name: 'dule',
          base: '123',
        },
        caller_address: 'bob.testnet',
      },
    );
    expect(response).toStrictEqual(
      new NotFound<TransactionRequestDto>('Transaction request not found'),
    );
  });
});
