import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Mongoose, { Model } from 'mongoose';
import {
  BadRequest,
  NotFound,
  ServerError,
  Unauthorized,
} from '../../helpers/response/errors';
import { generateKey } from '../../helpers/api-key/api-key-generator';
import { ApiKey, ApiKeyDocument } from './entities/api-key.entity';
import { ServiceResult } from '../../helpers/response/result';
import { Project, ProjectDocument } from '../project/entities/project.entity';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { ApiKeyDto } from './dto/api-key.dto';
import { mapToApiKeyDto, mapToPaginatedApiKeyDto } from './mappers/mappers';
import { RevokeApiKeyDto } from './dto/revoke-api-key.dto';
import { RegenerateApiKeyDto } from './dto/regenerate-api-key.dto';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectModel(ApiKey.name) private apiKeyRepo: Model<ApiKeyDocument>,
    @InjectModel(Project.name) private projectRepo: Model<ProjectDocument>,
  ) {}

  async create(dto: CreateApiKeyDto): Promise<ServiceResult<ApiKeyDto>> {
    try {
      if (!dto.project_id) {
        return new BadRequest<ApiKeyDto>(`project_id can't be empty`);
      }

      if (!Mongoose.Types.ObjectId.isValid(dto.project_id)) {
        return new NotFound<ApiKeyDto>('Project not found');
      }

      const project = await this.projectRepo
        .findOne({ _id: dto.project_id })
        .populate('owner')
        .exec();

      if (!project) {
        return new NotFound<ApiKeyDto>('Project not found');
      }

      if (project.owner._id.toString() !== dto.owner.toString()) {
        return new Unauthorized<ApiKeyDto>(
          'Unauthorized access to user project',
        );
      }

      const api_key = await generateKey();

      const key = await new this.apiKeyRepo({
        api_key: api_key,
        project: project,
        expires: dto.expires,
        owner: dto.owner,
      }).save();

      return new ServiceResult<ApiKeyDto>(mapToApiKeyDto(key));
    } catch (error) {
      this.logger.error('ApiKeyService - create', error);
      return error.errors
        ? new BadRequest<ApiKeyDto>(error.toString())
        : new ServerError<ApiKeyDto>(`Can't create api key`);
    }
  }

  async findAll(
    ownerId: Mongoose.Types.ObjectId,
    offset?: number,
    limit?: number,
    project_id?: string,
    api_key?: string,
  ): Promise<ServiceResult<PaginatedDto<ApiKeyDto>>> {
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

      if (api_key) {
        queryAnd.$and.push({
          api_key: { $regex: api_key, $options: 'i' },
        });
      }

      paginatedAggregate.push({ $match: queryAnd });

      if (offset) {
        paginatedAggregate.push({ $skip: Number(offset) });
      }

      if (limit) {
        paginatedAggregate.push({ $limit: Number(limit) });
      }

      const [{ paginatedResult, totalCount }] = await this.apiKeyRepo
        .aggregate([
          {
            $facet: {
              paginatedResult: paginatedAggregate,
              totalCount: [{ $match: queryAnd }, { $count: 'count' }],
            },
          },
        ])
        .exec();

      const paginated = {
        total: totalCount.length > 0 ? totalCount[0].count : 0,
        count: paginatedResult.length,
        offset: offset ? Number(offset) : 0,
        limit: limit ? Number(limit) : 0,
        results: paginatedResult,
      };

      const apiKeyDtos: ApiKeyDto[] = [];

      for (const apiKey of paginatedResult) {
        const dto = mapToApiKeyDto(apiKey);
        apiKeyDtos.push(dto);
      }

      const paginatedApiKeyDto = mapToPaginatedApiKeyDto(paginated, apiKeyDtos);

      return new ServiceResult<PaginatedDto<ApiKeyDto>>(paginatedApiKeyDto);
    } catch (error) {
      this.logger.error('ApiKeyService - findAll', error);
      return error.errors
        ? new BadRequest<PaginatedDto<ApiKeyDto>>(error.toString())
        : new ServerError<PaginatedDto<ApiKeyDto>>(`Can't get api keys`);
    }
  }

  async getFirstActive(
    projectId: string,
    ownerId: string,
  ): Promise<ServiceResult<ApiKeyDto>> {
    try {
      if (!Mongoose.Types.ObjectId.isValid(projectId)) {
        return new NotFound<ApiKeyDto>('Api key not found');
      }

      const apiKey = await this.apiKeyRepo
        .findOne({
          project: new Mongoose.Types.ObjectId(projectId),
          expires: { $gt: new Date() },
          is_revoked: false,
        })
        .populate('owner')
        .exec();

      if (!apiKey) {
        return new NotFound<ApiKeyDto>('Api key not found');
      }

      if (apiKey.owner._id.toString() !== ownerId) {
        return new Unauthorized<ApiKeyDto>(
          'Unauthorized access to user apiKey',
        );
      }

      return new ServiceResult<ApiKeyDto>(mapToApiKeyDto(apiKey));
    } catch (error) {
      this.logger.error('ApiKeyService - getFirstActive', error);
      return error.errors
        ? new BadRequest<ApiKeyDto>(error.toString())
        : new ServerError<ApiKeyDto>(`Can't get api key`);
    }
  }

  async isValid(apiKey: string): Promise<ServiceResult<boolean>> {
    try {
      const apiKeyDb = await this.apiKeyRepo
        .findOne({ api_key: apiKey })
        .exec();

      if (!apiKeyDb) {
        return new NotFound<boolean>('Api key not found');
      }

      if (apiKeyDb.is_revoked) {
        return new BadRequest<boolean>('Api key revoked');
      }

      if (apiKeyDb.expires <= new Date()) {
        return new BadRequest<boolean>('Api key expired');
      }

      return new ServiceResult<boolean>(true);
    } catch (error) {
      this.logger.error('ApiKeyService - isValid', error);
      return error.errors
        ? new BadRequest<boolean>(error.toString())
        : new ServerError<boolean>(`Can't validate api key`);
    }
  }

  async getUserByApiKey(apiKey: string): Promise<ServiceResult<User>> {
    try {
      const apiKeyDb = await this.apiKeyRepo
        .findOne({ api_key: apiKey })
        .populate('owner')
        .exec();

      if (!apiKeyDb) {
        return new NotFound<User>('Api key not found');
      }

      if (apiKeyDb.is_revoked) {
        return new BadRequest<User>('Api key revoked');
      }

      if (apiKeyDb.expires <= new Date()) {
        return new BadRequest<User>('Api key expired');
      }

      return new ServiceResult<User>(apiKeyDb.owner);
    } catch (error) {
      this.logger.error('ApiKeyService - getUserByApiKey', error);
      return error.errors
        ? new BadRequest<User>(error.toString())
        : new ServerError<User>(`Can't get user by api key`);
    }
  }

  async regenerate(
    apiKey: string,
    dto: RegenerateApiKeyDto,
    ownerId: string,
  ): Promise<ServiceResult<ApiKeyDto>> {
    try {
      const apiKeyDb = await this.apiKeyRepo
        .findOne({ api_key: apiKey })
        .populate('owner')
        .exec();

      if (!apiKeyDb) {
        return new NotFound<ApiKeyDto>('Api key not found');
      }

      if (apiKeyDb.owner._id.toString() !== ownerId) {
        return new Unauthorized<ApiKeyDto>(
          'Unauthorized access to user apiKey',
        );
      }

      if (apiKeyDb.is_revoked) {
        return new BadRequest<ApiKeyDto>('Api key revoked');
      }

      apiKeyDb.api_key = await generateKey();
      apiKeyDb.expires = dto.expires;
      apiKeyDb.updatedAt = new Date();
      await this.apiKeyRepo.updateOne({ _id: apiKeyDb._id }, apiKeyDb);

      const updatedApiKey = await this.apiKeyRepo
        .findOne({ _id: apiKeyDb._id })
        .exec();

      return new ServiceResult<ApiKeyDto>(mapToApiKeyDto(updatedApiKey));
    } catch (error) {
      this.logger.error('ApiKeyService - regenerate', error);
      return error.errors
        ? new BadRequest<ApiKeyDto>(error.toString())
        : new ServerError<ApiKeyDto>(`Can't regenerate api key`);
    }
  }

  async revoke(
    apiKey: string,
    dto: RevokeApiKeyDto,
    ownerId: string,
  ): Promise<ServiceResult<ApiKeyDto>> {
    try {
      const apiKeyDb = await this.apiKeyRepo
        .findOne({ api_key: apiKey })
        .populate('owner')
        .exec();

      if (!apiKeyDb) {
        return new NotFound<ApiKeyDto>('Api key not found');
      }

      if (apiKeyDb.expires <= new Date()) {
        return new BadRequest<ApiKeyDto>('Api key expired');
      }

      if (apiKeyDb.owner._id.toString() !== ownerId) {
        return new Unauthorized<ApiKeyDto>(
          'Unauthorized access to user apiKey',
        );
      }

      apiKeyDb.is_revoked = dto.is_revoked;
      apiKeyDb.updatedAt = new Date();
      await this.apiKeyRepo.updateOne({ _id: apiKeyDb._id }, apiKeyDb);

      const updatedApiKey = await this.apiKeyRepo
        .findOne({ _id: apiKeyDb._id })
        .exec();

      return new ServiceResult<ApiKeyDto>(mapToApiKeyDto(updatedApiKey));
    } catch (error) {
      this.logger.error('ApiKeyService - isValid', error);
      return error.errors
        ? new BadRequest<ApiKeyDto>(error.toString())
        : new ServerError<ApiKeyDto>(`Can't revoke api key`);
    }
  }

  async remove(id: string, ownerId: string): Promise<ServiceResult<ApiKey>> {
    try {
      if (!Mongoose.Types.ObjectId.isValid(id)) {
        return new NotFound<ApiKey>('Api key not found');
      }

      const apiKey = await this.apiKeyRepo
        .findOne({ _id: id })
        .populate('owner')
        .exec();

      if (!apiKey) {
        return new NotFound<ApiKey>('Api key not found');
      }

      if (apiKey.owner._id.toString() !== ownerId) {
        return new Unauthorized<ApiKey>('Unauthorized access to user api key');
      }

      const result = await this.apiKeyRepo.findByIdAndDelete(id).exec();
      return new ServiceResult<ApiKey>(result);
    } catch (error) {
      this.logger.error('ApiKeyService - remove', error);
      return new ServerError<ApiKey>(`Can't remove api key`);
    }
  }
}
