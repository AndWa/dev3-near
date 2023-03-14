import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from '../../helpers/response/errors';
import {
  mockApiKeyDtos,
  mockApiKeys,
  mockCreateApiKeyDto1,
  mockCreateApiKeyDtos,
  mockUser,
} from '../../../test/mock-tests-data';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { ServiceResult } from '../../helpers/response/result';
import { Project } from '../project/entities/project.entity';

import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { ApiKeyDto } from './dto/api-key.dto';
import { ApiKey } from './entities/api-key.entity';
import Mongoose from 'mongoose';
import { generateKey } from '../../helpers/api-key/api-key-generator';
import { addDays } from '../../helpers/date/date-helper';

describe('ApiKeyController', () => {
  let apiKeyController: ApiKeyController;
  let apiKeyService: ApiKeyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyController,
        ApiKeyService,
        { provide: getModelToken(ApiKey.name), useValue: jest.fn() },
        { provide: getModelToken(Project.name), useValue: jest.fn() },
      ],
    }).compile();

    apiKeyService = module.get<ApiKeyService>(ApiKeyService);
    apiKeyController = module.get<ApiKeyController>(ApiKeyController);
  });

  describe('create', () => {
    it('should create one api key', async () => {
      const result = new ServiceResult<ApiKeyDto>(mockApiKeyDtos[0]);
      jest.spyOn(apiKeyService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await apiKeyController.create(req, mockCreateApiKeyDto1);
      expect(response).toBe(result.data);
    });

    it(`should return project_id can't be empty (Bad request - 400) exception`, async () => {
      const dto = { ...mockCreateApiKeyDtos[0] };
      dto.project_id = undefined;
      const result = new BadRequest<ApiKeyDto>(`project_id can't be empty`);
      jest.spyOn(apiKeyService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await apiKeyController.create(req, dto);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe(`project_id can't be empty`);
      }
    });

    it(`should return Project not found (Not Found - 404) exception`, async () => {
      const dto = { ...mockCreateApiKeyDtos[0] };
      dto.project_id = '123';
      const result = new NotFound<ApiKeyDto>(`Project not found`);
      jest.spyOn(apiKeyService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await apiKeyController.create(req, dto);
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe(`Project not found`);
      }
    });

    it(`should return Project not found (Not Found - 404) exception`, async () => {
      const dto = { ...mockCreateApiKeyDtos[0] };
      dto.project_id = '634ff1e4bb85ed4475a1ff5d';
      const result = new NotFound<ApiKeyDto>(`Project not found`);
      jest.spyOn(apiKeyService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await apiKeyController.create(req, dto);
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe(`Project not found`);
      }
    });

    it(`should return Unauthorized access to user project (Unauthorized - 401) exception`, async () => {
      const result = new Unauthorized<ApiKeyDto>(
        `Unauthorized access to user project`,
      );
      jest.spyOn(apiKeyService, 'create').mockResolvedValue(result);
      const user = mockUser;
      user._id = new Mongoose.Types.ObjectId('634ff1e4bb85ed4475a1ff5d');
      const req: any = {
        user: user,
      };
      try {
        await apiKeyController.create(req, mockCreateApiKeyDtos[0]);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe(`Unauthorized access to user project`);
      }
    });
  });

  describe('findAll', () => {
    it('should return all api keys', async () => {
      const result = new ServiceResult<PaginatedDto<ApiKeyDto>>({
        total: 4,
        count: 4,
        limit: 0,
        offset: 0,
        results: mockApiKeyDtos,
      });
      jest.spyOn(apiKeyService, 'findAll').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await apiKeyController.findAll(req);
      expect(response).toBe(result.data);
    });
  });

  describe('findOne', () => {
    it('should return one active api key', async () => {
      const result = new ServiceResult<ApiKeyDto>(mockApiKeyDtos[0]);
      jest.spyOn(apiKeyService, 'getFirstActive').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await apiKeyController.findOne(
        req,
        mockApiKeyDtos[0].project_id,
      );
      expect(response).toBe(result.data);
    });

    it('should return Api key not found (Not Found - 404) exception', async () => {
      const result = new NotFound<ApiKeyDto>('Api key not found');
      jest.spyOn(apiKeyService, 'getFirstActive').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await apiKeyController.findOne(req, '634ff1e4bb85ed5475a1ff65');
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Api key not found');
      }
    });

    it('should return Api key not found (Not Found - 404) exception', async () => {
      const result = new NotFound<ApiKeyDto>('Api key not found');
      jest.spyOn(apiKeyService, 'getFirstActive').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await apiKeyController.findOne(req, '123');
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Api key not found');
      }
    });

    it('should return Unauthorized access to user apiKey (Unauthorized - 401) exception', async () => {
      const result = new Unauthorized<ApiKeyDto>(
        'Unauthorized access to user apiKey',
      );
      jest.spyOn(apiKeyService, 'getFirstActive').mockResolvedValue(result);

      const user = mockUser;
      user._id = new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff65');
      const req: any = {
        user: user,
      };
      try {
        await apiKeyController.findOne(req, mockApiKeyDtos[0].project_id);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Unauthorized access to user apiKey');
      }
    });
  });

  describe('isValid', () => {
    it('should check if apiKey is valid', async () => {
      const result = new ServiceResult<boolean>(true);
      jest.spyOn(apiKeyService, 'isValid').mockResolvedValue(result);
      const response = await apiKeyController.isValid(await generateKey());
      expect(response).toBe(true);
    });

    it('should return Api key not found (Not Found - 404) exception', async () => {
      const result = new NotFound<boolean>('Api key not found');
      jest.spyOn(apiKeyService, 'isValid').mockResolvedValue(result);
      try {
        await apiKeyController.isValid(await generateKey());
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Api key not found');
      }
    });
  });

  describe('regenerate', () => {
    it('should regenerate api key', async () => {
      const dto = mockApiKeyDtos[0];
      dto.api_key = await generateKey();
      const result = new ServiceResult<ApiKeyDto>(dto);
      jest.spyOn(apiKeyService, 'regenerate').mockResolvedValue(result);
      const apiKey = await generateKey();
      const req: any = {
        user: mockUser,
      };
      const response = await apiKeyController.regenerate(req, apiKey, {
        expires: addDays(new Date(), 30),
      });
      expect(response.api_key).not.toEqual(apiKey);
    });

    it('should return Api key not found (Not Found - 404) exception', async () => {
      const result = new NotFound<ApiKeyDto>('Api key not found');
      jest.spyOn(apiKeyService, 'regenerate').mockResolvedValue(result);
      const apiKey = await generateKey();
      const req: any = {
        user: mockUser,
      };

      try {
        await apiKeyController.regenerate(req, apiKey, {
          expires: addDays(new Date(), 30),
        });
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Api key not found');
      }
    });

    it('should return Unauthorized access to user apiKey (Unauthorized - 401) exception', async () => {
      const result = new Unauthorized<ApiKeyDto>(
        'Unauthorized access to user apiKey',
      );
      jest.spyOn(apiKeyService, 'regenerate').mockResolvedValue(result);

      const user = mockUser;
      user._id = new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff65');
      const req: any = {
        user: user,
      };
      const apiKey = await generateKey();
      try {
        await apiKeyController.regenerate(req, apiKey, {
          expires: addDays(new Date(), 30),
        });
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Unauthorized access to user apiKey');
      }
    });
  });

  describe('revoke', () => {
    it('should revoke api key', async () => {
      const dto = mockApiKeyDtos[0];
      dto.is_revoked = true;
      const result = new ServiceResult<ApiKeyDto>(dto);
      jest.spyOn(apiKeyService, 'revoke').mockResolvedValue(result);
      const apiKey = await generateKey();
      const req: any = {
        user: mockUser,
      };
      const response = await apiKeyController.revoke(req, apiKey, {
        is_revoked: true,
      });
      expect(response.is_revoked).toEqual(true);
    });

    it('should return Api key not found (Not Found - 404) exception', async () => {
      const result = new NotFound<ApiKeyDto>('Api key not found');
      jest.spyOn(apiKeyService, 'revoke').mockResolvedValue(result);
      const apiKey = await generateKey();
      const req: any = {
        user: mockUser,
      };

      try {
        await apiKeyController.revoke(req, apiKey, {
          is_revoked: true,
        });
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Api key not found');
      }
    });

    it('should return Unauthorized access to user apiKey (Unauthorized - 401) exception', async () => {
      const result = new Unauthorized<ApiKeyDto>(
        'Unauthorized access to user apiKey',
      );
      jest.spyOn(apiKeyService, 'revoke').mockResolvedValue(result);

      const user = mockUser;
      user._id = new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff65');
      const req: any = {
        user: user,
      };
      const apiKey = await generateKey();
      try {
        await apiKeyController.revoke(req, apiKey, {
          is_revoked: true,
        });
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Unauthorized access to user apiKey');
      }
    });
  });

  describe('revoke', () => {
    it('should remove api key', async () => {
      const entity = mockApiKeys[0];
      (entity as any).api_key = await generateKey();
      const result = new ServiceResult<ApiKey>(entity as any);
      jest.spyOn(apiKeyService, 'remove').mockResolvedValue(result);

      const req: any = {
        user: mockUser,
      };
      const response = await apiKeyController.remove(
        req,
        mockApiKeys[0]._id.toString(),
      );

      expect(response).toStrictEqual(result.data);
    });

    it('should return Api key not found (Not Found - 404) exception', async () => {
      const result = new NotFound<ApiKey>('Api key not found');
      jest.spyOn(apiKeyService, 'remove').mockResolvedValue(result);

      const req: any = {
        user: mockUser,
      };

      try {
        await apiKeyController.remove(req, mockApiKeyDtos[0].id);
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Api key not found');
      }
    });

    it('should return Unauthorized access to user apiKey (Unauthorized - 401) exception', async () => {
      const result = new Unauthorized<ApiKey>(
        'Unauthorized access to user apiKey',
      );
      jest.spyOn(apiKeyService, 'remove').mockResolvedValue(result);

      const user = mockUser;
      user._id = new Mongoose.Types.ObjectId('634ff1e4bb85ed5475a1ff65');
      const req: any = {
        user: user,
      };
      try {
        await apiKeyController.remove(req, mockApiKeyDtos[0].id);
      } catch (error) {
        expect(error.status).toBe(401);
        expect(error.message).toBe('Unauthorized access to user apiKey');
      }
    });
  });
});
