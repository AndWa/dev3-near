import { ServiceError } from './error';

export class ServiceResult<T> {
  constructor(readonly data?: T, readonly error?: ServiceError) {}
}

export class ServiceResultEmpty {
  constructor(readonly error?: ServiceError) {}
}
