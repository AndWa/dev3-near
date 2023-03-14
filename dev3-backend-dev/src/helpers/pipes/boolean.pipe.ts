import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class BooleanPipe implements PipeTransform {
  transform(value: any) {
    if (!value) {
      return undefined;
    }
    value = value.toLowerCase();

    return value === 'true' || value === '1' ? true : false;
  }
}
