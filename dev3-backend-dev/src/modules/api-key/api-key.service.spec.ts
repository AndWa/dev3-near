import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCreateApiKeyDtos,
  mockProjects,
  mockUser,
} from '../../../test/mock-tests-data';
import { User, UserSchema } from '../user/entities/user.entity';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Mongoose, { connect, Connection, Model } from 'mongoose';
import { ApiKey, ApiKeySchema } from './entities/api-key.entity';
import { ApiKeyService } from './api-key.service';
import { Project, ProjectSchema } from '../project/entities/project.entity';
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from '../../helpers/response/errors';
import { ApiKeyDto } from './dto/api-key.dto';
import { addDays } from '../../helpers/date/date-helper';

describe('ApiKeyService', () => {
  let apiKeyService: ApiKeyService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let apiKeyModel: Model<ApiKey>;
  let projectModel: Model<Project>;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    apiKeyModel = mongoConnection.model(ApiKey.name, ApiKeySchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    projectModel = mongoConnection.model(Project.name, ProjectSchema);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        { provide: getModelToken(ApiKey.name), useValue: apiKeyModel },
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Project.name), useValue: projectModel },
      ],
    }).compile();

    apiKeyService = module.get<ApiKeyService>(ApiKeyService);
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
    const createdApiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    expect(createdApiKey.data.project_id.toString()).toBe(
      mockCreateApiKeyDtos[0].project_id,
    );
    expect(createdApiKey.data.api_key).toBeDefined();
  });

  it(`Create - should return project_id can't be empty (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateApiKeyDtos[0] };
    delete dto.project_id;
    const response = await apiKeyService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<ApiKeyDto>(`project_id can't be empty`),
    );
  });

  it(`Create - should return Project not found (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateApiKeyDtos[0] };
    dto.project_id = '123';
    const response = await apiKeyService.create(dto);
    expect(response).toStrictEqual(
      new NotFound<ApiKeyDto>('Project not found'),
    );
  });

  it(`Create - should return Project not found (Bad Request - 400) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateApiKeyDtos[0] };
    dto.project_id = '624ff1e4bb85ed5475a1ff5d';
    const response = await apiKeyService.create(dto);
    expect(response).toStrictEqual(
      new NotFound<ApiKeyDto>('Project not found'),
    );
  });

  it(`Create - should return Unauthorized access to user project (Unauthorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const dto = { ...mockCreateApiKeyDtos[0] };
    dto.owner = new Mongoose.Types.ObjectId('624ff1e4bb85ed5475a1ff5d');
    const response = await apiKeyService.create(dto);
    expect(response).toStrictEqual(
      new Unauthorized<ApiKeyDto>('Unauthorized access to user project'),
    );
  });

  it(`FindAll - should findAll`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    await apiKeyService.create(mockCreateApiKeyDtos[1]);
    const result = await apiKeyService.findAll(mockUser._id);
    expect(result.data.results).toHaveLength(1);
    expect(result.data.count).toBe(1);
  });

  it(`GetFirstActive - should getFirstActive`, async () => {
    const user = await new userModel(mockUser).save();
    const project = await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const result = await apiKeyService.getFirstActive(
      project._id.toString(),
      user._id.toString(),
    );

    expect(result.data.project_id).toBe(mockCreateApiKeyDtos[0].project_id);
  });

  it(`GetFirstActive - should return Api key not found (Not Found - 404) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.getFirstActive(
      '12',
      user._id.toString(),
    );
    expect(response).toStrictEqual(
      new NotFound<ApiKeyDto>('Api key not found'),
    );
  });

  it(`GetFirstActive - should return Api key not found (Not Found - 404) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.getFirstActive(
      '634fe1e4bb85ed5475a1ff5d',
      user._id.toString(),
    );
    expect(response).toStrictEqual(
      new NotFound<ApiKeyDto>('Api key not found'),
    );
  });

  it(`GetFirstActive - should return Unauthorized access to user apiKey (Unauthorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    const project = await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.getFirstActive(
      project._id.toString(),
      '624ff1e4bb85ed5475a1ff5d',
    );

    expect(response).toStrictEqual(
      new Unauthorized<ApiKeyDto>('Unauthorized access to user apiKey'),
    );
  });

  it(`IsValid - should get is api key valid`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const result = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.isValid(result.data.api_key);

    expect(response.data).toBe(true);
  });

  it(`IsValid - should return Api key not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.isValid('123');

    expect(response).toStrictEqual(new NotFound<boolean>('Api key not found'));
  });

  it(`IsValid - should return Api key revoked (Bad Request - 400) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    await apiKeyService.revoke(
      apiKey.data.api_key,
      { is_revoked: true },
      user._id.toString(),
    );
    const response = await apiKeyService.isValid(apiKey.data.api_key);

    expect(response).toStrictEqual(new BadRequest<boolean>('Api key revoked'));
  });

  it(`getUserByApiKey - should get user by api key`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const result = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.getUserByApiKey(result.data.api_key);

    expect(response.data.uid).toBe(mockUser.uid);
  });

  it(`getUserByApiKey - should return Api key not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.getUserByApiKey('123');

    expect(response).toStrictEqual(new NotFound<User>('Api key not found'));
  });

  it(`getUserByApiKey - should return Api key revoked (Bad Request - 400) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    await apiKeyService.revoke(
      apiKey.data.api_key,
      { is_revoked: true },
      user._id.toString(),
    );
    const response = await apiKeyService.getUserByApiKey(apiKey.data.api_key);

    expect(response).toStrictEqual(new BadRequest<User>('Api key revoked'));
  });

  it(`Regenerate - should get regenerated api key`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const result = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.regenerate(
      result.data.api_key,
      { expires: addDays(new Date(), 30) },
      user._id.toString(),
    );

    expect(result.data.api_key).not.toEqual(response.data.api_key);
  });

  it(`Regenerate - Api key not found (Not Found - 404) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.regenerate(
      '123',
      { expires: addDays(new Date(), 30) },
      user._id.toString(),
    );

    expect(response).toStrictEqual(
      new NotFound<ApiKeyDto>('Api key not found'),
    );
  });

  it(`Regenerate - Api key revoked (Bad Request - 400) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    await apiKeyService.revoke(
      apiKey.data.api_key,
      { is_revoked: true },
      user._id.toString(),
    );
    const response = await apiKeyService.regenerate(
      apiKey.data.api_key,
      { expires: addDays(new Date(), 30) },
      user._id.toString(),
    );

    expect(response).toStrictEqual(
      new BadRequest<ApiKeyDto>('Api key revoked'),
    );
  });

  it(`Regenerate - should return Unauthorized access to user apiKey (Unathorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);

    const response = await apiKeyService.regenerate(
      apiKey.data.api_key,
      { expires: addDays(new Date(), 30) },
      '12',
    );

    expect(response).toStrictEqual(
      new Unauthorized<ApiKeyDto>('Unauthorized access to user apiKey'),
    );
  });

  it(`Revoke - should revoke api key`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.revoke(
      apiKey.data.api_key,
      { is_revoked: true },
      user._id.toString(),
    );

    expect(response.data.is_revoked).toBe(true);
  });

  it(`Revoke - should re-approve api key`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.revoke(
      apiKey.data.api_key,
      { is_revoked: false },
      user._id.toString(),
    );

    expect(response.data.is_revoked).toBe(false);
  });

  it(`Revoke - should return Api key not found (Not Found - 404) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.revoke(
      '123',
      { is_revoked: true },
      user._id.toString(),
    );

    expect(response).toStrictEqual(
      new NotFound<ApiKeyDto>('Api key not found'),
    );
  });

  it(`Revoke - should return Unauthorized access to user apiKey (Unathorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.revoke(
      apiKey.data.api_key,
      { is_revoked: true },
      '123',
    );

    expect(response).toStrictEqual(
      new Unauthorized<ApiKeyDto>('Unauthorized access to user apiKey'),
    );
  });

  it(`Revoke - should return Api key not found (Not Found - 404) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    await apiKeyService.remove(apiKey.data.id, user._id.toString());

    const response = await apiKeyService.isValid(apiKey.data.api_key);

    expect(response).toStrictEqual(
      new NotFound<ApiKeyDto>('Api key not found'),
    );
  });

  it(`Revoke - should return Api key not found (Not Found - 404) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.remove('123', user._id.toString());

    expect(response).toStrictEqual(
      new NotFound<ApiKeyDto>('Api key not found'),
    );
  });

  it(`Revoke - should return Unauthorized access to user apiKey (Unathorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const apiKey = await apiKeyService.create(mockCreateApiKeyDtos[0]);
    const response = await apiKeyService.remove(apiKey.data.id, '123');

    expect(response).toStrictEqual(
      new Unauthorized<ApiKeyDto>('Unauthorized access to user api key'),
    );
  });
});
