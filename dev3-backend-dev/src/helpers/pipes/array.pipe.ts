import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class ArrayPipe implements PipeTransform {
  transform(value: string | string[]) {
    if (Array.isArray(value)) {
      return value;
    }

    if (value) {
      return [value];
    }
    return undefined;
  }
}
