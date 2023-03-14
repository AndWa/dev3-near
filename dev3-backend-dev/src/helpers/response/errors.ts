import { ServiceError } from './error';
import { ServiceResult } from './result';

export class BadRequest<T> extends ServiceResult<T> {
  constructor(message?: string) {
    super(null, new ServiceError(400, message));
  }
}

export class Unauthorized<T> extends ServiceResult<T> {
  constructor(message?: string) {
    super(null, new ServiceError(401, message));
  }
}

export class NotFound<T> extends ServiceResult<T> {
  constructor(message?: string) {
    super(null, new ServiceError(404, message));
  }
}

export class ServerError<T> extends ServiceResult<T> {
  constructor(message?: string) {
    super(null, new ServiceError(500, message));
  }
}
