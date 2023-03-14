import { PaginatedDto } from '../../../common/pagination/paginated-dto';
import { ApiKeyDto } from '../dto/api-key.dto';
import { ApiKey } from '../entities/api-key.entity';
import Mongoose from 'mongoose';

export const mapToApiKeyDto = (
  apiKey: Partial<
    ApiKey &
      Mongoose.Document<any, any, any> & {
        _id: Mongoose.Types.ObjectId;
      }
  >,
): ApiKeyDto => {
  return {
    id: apiKey.id,
    created_at: apiKey.createdAt,
    expires: apiKey.expires,
    is_revoked: apiKey.is_revoked,
    api_key: apiKey.api_key,
    project_id: apiKey.project._id.toString(),
  };
};

export const mapToPaginatedApiKeyDto = (
  dto: PaginatedDto<ApiKey>,
  results: ApiKeyDto[],
): PaginatedDto<ApiKeyDto> => {
  return {
    total: dto.total,
    count: dto.count,
    limit: dto.limit,
    offset: dto.offset,
    results: results,
  };
};
