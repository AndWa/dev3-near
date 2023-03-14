import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { ApiKeyService } from '../../../modules/api-key/api-key.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(private readonly apiKeyService: ApiKeyService) {
    super(
      { header: 'api-key', prefix: '' },
      true,
      async (apiKey: string, done: any) => {
        const response = await this.apiKeyService.isValid(apiKey);
        if (response.data) {
          const responseGetUser = await this.apiKeyService.getUserByApiKey(
            apiKey,
          );

          done(null, responseGetUser.data, true);
        }
        done(new UnauthorizedException(), null);
      },
    );
  }
}
