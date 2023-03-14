import { HttpException } from '@nestjs/common';
import { ServiceResult, ServiceResultEmpty } from './result';

export const handle = async <T>(result: ServiceResult<T>) => {
  if (result.data) {
    return result.data;
  }

  throw new HttpException(result.error.message, result.error.code);
};

export const handleEmtpy = async (result: ServiceResultEmpty) => {
  if (result.error) {
    throw new HttpException(result.error.message, result.error.code);
  }
};
