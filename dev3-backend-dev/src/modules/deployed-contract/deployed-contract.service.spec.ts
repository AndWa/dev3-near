import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from '../../helpers/response/errors';
import {
  mockContractTemplates,
  mockCreateDeployedContractDtos,
  mockDeployedContracts,
  mockProjects,
  mockUser,
} from '../../../test/mock-tests-data';
import { Contract, ContractSchema } from '../contract/entities/contract.entity';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { DeployedContractService } from './deployed-contract.service';
import {
  DeployedContract,
  DeployedContractSchema,
} from './entities/deployed-contract.entity';
import { DeployedContractStatus } from '../../common/enums/deployed-contract-status.enum';
import { DeployedContractDto } from './dto/deployed-contract.dto';
import { File, FileSchema } from '../file/entities/file.entity';

describe('DeployedContractService', () => {
  let deployedContractService: DeployedContractService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let projectModel: Model<Project>;
  let userModel: Model<User>;
  let contractTemplateModel: Model<Contract>;
  let deployedContractModel: Model<DeployedContract>;
  let fileModel: Model<File>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    projectModel = mongoConnection.model(Project.name, ProjectSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    contractTemplateModel = mongoConnection.model(
      Contract.name,
      ContractSchema,
    );
    deployedContractModel = mongoConnection.model(
      DeployedContract.name,
      DeployedContractSchema,
    );
    fileModel = mongoConnection.model(File.name, FileSchema);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeployedContractService,
        { provide: getModelToken(Project.name), useValue: projectModel },
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: getModelToken(Contract.name),
          useValue: contractTemplateModel,
        },
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
          provide: getModelToken(DeployedContract.name),
          useValue: deployedContractModel,
        },
        {
          provide: getModelToken(File.name),
          useValue: fileModel,
        },
      ],
    }).compile();

    deployedContractService = module.get<DeployedContractService>(
      DeployedContractService,
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
    await new contractTemplateModel(mockContractTemplates[0]).save();

    const createdDeployedContract = await deployedContractService.create(
      mockCreateDeployedContractDtos[0],
    );

    expect(createdDeployedContract.data.alias).toBe(
      mockCreateDeployedContractDtos[0].alias,
    );
  });

  it(`Create - should return Alias can't be empty (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const dto: any = { ...mockCreateDeployedContractDtos[0] };
    delete dto.alias;
    const response = await deployedContractService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<DeployedContract>(`Alias can't be empty`),
    );
  });

  it(`Create - should return Contract uuid can't be empty (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const dto: any = { ...mockCreateDeployedContractDtos[0] };
    delete dto.contract_template_id;
    const response = await deployedContractService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<DeployedContract>(`Contract uuid can't be empty`),
    );
  });

  it(`Create - should return Contract template not found (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const dto: any = { ...mockCreateDeployedContractDtos[0] };
    dto.contract_template_id = '123';
    const response = await deployedContractService.create(dto);
    expect(response).toStrictEqual(
      new NotFound<DeployedContract>(`Contract template not found`),
    );
  });

  it(`Create - should return Args can't be empty (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const dto: any = { ...mockCreateDeployedContractDtos[0] };
    delete dto.args;
    const response = await deployedContractService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<DeployedContract>(`Args can't be empty`),
    );
  });

  it(`Create - should return Project id can't be empty (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const dto: any = { ...mockCreateDeployedContractDtos[0] };
    delete dto.project_id;
    const response = await deployedContractService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<DeployedContract>(`Project id can't be empty`),
    );
  });

  it(`Create - should return Project not found (Not found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const dto: any = { ...mockCreateDeployedContractDtos[0] };
    dto.project_id = '123';
    const response = await deployedContractService.create(dto);
    expect(response).toStrictEqual(
      new NotFound<DeployedContract>(`Project not found`),
    );
  });

  it(`Create - should return Project not found (Not found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const dto: any = { ...mockCreateDeployedContractDtos[0] };
    dto.project_id = '783fa1f4bb85ec3265b2ef5d';
    const response = await deployedContractService.create(dto);
    expect(response).toStrictEqual(
      new NotFound<DeployedContract>(`Project not found`),
    );
  });

  it(`Create - should return Contract template not found (Not found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const dto: any = { ...mockCreateDeployedContractDtos[0] };
    dto.contract_template_id = '783fa1f4bb85ec3265b2ef5d';
    const response = await deployedContractService.create(dto);
    expect(response).toStrictEqual(
      new NotFound<DeployedContract>(`Contract template not found`),
    );
  });

  it(`Create - should return Contract template not found (Not found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await deployedContractService.create(mockCreateDeployedContractDtos[0]);
    const response = await deployedContractService.create(
      mockCreateDeployedContractDtos[0],
    );
    expect(response).toStrictEqual(
      new BadRequest<DeployedContract>(
        `Alias ${mockCreateDeployedContractDtos[0].alias} isn't unique`,
      ),
    );
  });

  it(`FindAll - should findAll`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await deployedContractService.create(mockCreateDeployedContractDtos[0]);
    await deployedContractService.create(mockCreateDeployedContractDtos[1]);
    const result = await deployedContractService.findAll(mockUser._id);
    expect(result.data.results).toHaveLength(2);
    expect(result.data.count).toBe(2);
  });

  it(`FindAll - should findAll by project id`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await new contractTemplateModel(mockContractTemplates[1]).save();
    await deployedContractService.create(mockCreateDeployedContractDtos[0]);
    await deployedContractService.create(mockCreateDeployedContractDtos[1]);

    const result = await deployedContractService.findAll(
      mockUser._id,
      null, //   offset:
      null, //   limit: null,
      mockCreateDeployedContractDtos[0].project_id, //   project_id: null,
      null, //   alias: null,
      null, //   status: null,
      null, //   tags: null,
    );

    expect(result.data.results).toHaveLength(2);
    expect(result.data.count).toBe(2);
  });

  it(`FindAll - should findAll by alias`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await new contractTemplateModel(mockContractTemplates[1]).save();
    await deployedContractService.create(mockCreateDeployedContractDtos[0]);
    await deployedContractService.create(mockCreateDeployedContractDtos[1]);

    const result = await deployedContractService.findAll(
      mockUser._id,
      null, //   offset:
      null, //   limit: null,
      null, //   project_id: null,
      'erc20', //   alias: null,
      null, //   status: null,
      null, //   tags: null,
    );

    expect(result.data.results).toHaveLength(2);
    expect(result.data.count).toBe(2);
  });

  it(`FindAll - should findAll by status`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await new contractTemplateModel(mockContractTemplates[1]).save();
    await deployedContractService.create(mockCreateDeployedContractDtos[0]);
    await deployedContractService.create(mockCreateDeployedContractDtos[1]);

    const result = await deployedContractService.findAll(
      mockUser._id,
      null, //   offset:
      null, //   limit: null,
      null, //   project_id: null,
      null, //   alias: null,
      DeployedContractStatus.Pending, //   status: null,
      null, //   tags: null,
    );

    expect(result.data.results).toHaveLength(2);
    expect(result.data.count).toBe(2);
  });

  it(`FindAll - should findAll tags`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await new contractTemplateModel(mockContractTemplates[1]).save();
    await deployedContractService.create(mockCreateDeployedContractDtos[0]);
    await deployedContractService.create(mockCreateDeployedContractDtos[1]);
    await deployedContractService.create(mockCreateDeployedContractDtos[2]);

    const result = await deployedContractService.findAll(
      mockUser._id,
      null, //   offset:
      null, //   limit: null,
      null, //   project_id: null,
      null, //   alias: null,
      null, //   status: null,
      ['tokens', 'nft'], //   tags: null,
    );

    expect(result.data.results).toHaveLength(3);
    expect(result.data.count).toBe(3);
  });

  it(`FindOne - should findOne`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const createResult = await deployedContractService.create(
      mockCreateDeployedContractDtos[0],
    );

    const result = await deployedContractService.findOne(
      createResult.data.uuid,
      mockUser._id.toString(),
    );

    expect(result.data._id.toString()).toBe(createResult.data._id.toString());
  });

  it(`FindOne - should findOne`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const createResult = await deployedContractService.create(
      mockCreateDeployedContractDtos[0],
    );

    const result = await deployedContractService.findOne(
      createResult.data.uuid,
      mockUser._id.toString(),
    );

    expect(result.data._id.toString()).toBe(createResult.data._id.toString());
  });

  it(`FindOne - should return Deployed contract not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await deployedContractService.create(mockCreateDeployedContractDtos[0]);
    const response = await deployedContractService.findOne(
      '12',
      mockUser._id.toString(),
    );
    expect(response).toStrictEqual(
      new NotFound<DeployedContract>('Deployed contract not found'),
    );
  });

  it(`FindOne - should return Unauthorized access to user deployed contract (Unauthorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const createResult = await deployedContractService.create(
      mockCreateDeployedContractDtos[0],
    );
    const response = await deployedContractService.findOne(
      createResult.data.uuid,
      '123',
    );
    expect(response).toStrictEqual(
      new Unauthorized<DeployedContract>(
        'Unauthorized access to user deployed contract',
      ),
    );
  });

  it(`FindByUuid - should by uuid`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const createResult = await deployedContractService.create(
      mockCreateDeployedContractDtos[0],
    );

    const result = await deployedContractService.findByUuid(
      createResult.data.uuid,
    );

    expect(result.data.uuid).toBe(createResult.data.uuid);
  });

  it(`FindByUuid - should return Deployed contract not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await deployedContractService.create(mockCreateDeployedContractDtos[0]);
    const response = await deployedContractService.findByUuid('12');
    expect(response).toStrictEqual(
      new NotFound<DeployedContract>('Deployed contract not found'),
    );
  });

  it(`Update - should update`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const createResult = await new deployedContractModel(
      mockDeployedContracts[0],
    ).save();

    const updateDto = {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      deployer_address: 'bob.testnet',
    };
    const result = await deployedContractService.update(
      createResult.uuid,
      updateDto,
    );

    expect(result.data.txHash).toBe(updateDto.txHash);
    expect(result.data.txDetails).toBeDefined();
    expect(result.data.deployer_address).toBe(updateDto.deployer_address);
  });

  it(`Update - should return Deployment contract not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await new deployedContractModel(mockDeployedContracts[0]).save();
    const response = await deployedContractService.update('12', {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      deployer_address: 'bob.testnet',
    });
    expect(response).toStrictEqual(
      new NotFound<DeployedContractDto>('Deployment contract not found'),
    );
  });

  it(`Update - should return Deployment contract transaction already confirmed (Bad request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const createResult = await new deployedContractModel(
      mockDeployedContracts[0],
    ).save();
    await deployedContractService.update(createResult.uuid, {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      deployer_address: 'bob.testnet',
    });

    const result = await deployedContractService.update(createResult.uuid, {
      txHash: '123',
      txDetails: {
        name: 'dule',
        base: '123',
      },
      deployer_address: 'bob.testnet',
    });
    expect(result).toStrictEqual(
      new BadRequest<DeployedContractDto>(
        'Deployment contract transaction already confirmed',
      ),
    );
  });

  it(`Remove - should delete one`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const createResult = await new deployedContractModel(
      mockDeployedContracts[0],
    ).save();

    await deployedContractService.remove(
      createResult.uuid,
      mockUser._id.toString(),
    );

    const response = await deployedContractService.findOne(
      createResult.uuid,
      mockUser._id.toString(),
    );

    expect(response).toStrictEqual(
      new NotFound<DeployedContract>('Deployed contract not found'),
    );
  });

  it(`Remove - should return Deployed contract not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    await new deployedContractModel(mockDeployedContracts[0]).save();
    const response = await deployedContractService.remove(
      '123',
      mockUser._id.toString(),
    );
    expect(response).toStrictEqual(new NotFound('Deployed contract not found'));
  });

  it(`Remove - should return Unauthorized access to user deployed contract (Unathorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await new contractTemplateModel(mockContractTemplates[0]).save();
    const createResult = await new deployedContractModel(
      mockDeployedContracts[0],
    ).save();
    const response = await deployedContractService.remove(
      createResult.uuid,
      '123',
    );
    expect(response).toStrictEqual(
      new Unauthorized('Unauthorized access to user deployed contract'),
    );
  });
});
