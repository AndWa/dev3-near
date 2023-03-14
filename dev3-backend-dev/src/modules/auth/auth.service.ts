import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as borsh from 'borsh';
import { sha256 } from 'js-sha256';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';
import * as nacl from 'tweetnacl';
import { edsa } from '../../common/constants';
import { ServiceResult } from '../../helpers/response/result';
import { JwtTokenDto } from './dto/jwt-token.dto';
import {
  BadRequest,
  NotFound,
  ServerError,
} from '../../helpers/response/errors';
import { mapJwtUser } from './mappers/map-jwt-user';
import { getRpcPostArguments } from './common/rpc-call-arguments';
import { Role } from '../../common/enums/role.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private jwtService: JwtService,
    private readonly userService: UserService,
    private configService: ConfigService,
  ) {}

  async getNearJwtToken(
    username: string,
    signedJsonString: string,
  ): Promise<ServiceResult<JwtTokenDto>> {
    try {
      const isValid = await this.nearValidate(username, signedJsonString);

      if (!isValid) return new NotFound('Not valid signature!');

      const user = await this.getOrCreateUser(username);
      if (!user) return new BadRequest('Error getting user');
      const dto = {
        token: this.jwtService.sign(user),
      };

      return new ServiceResult<JwtTokenDto>(dto);
    } catch (error) {
      this.logger.error('AuthService - getNearJwtToken', error);
      return new ServerError<JwtTokenDto>(`Can't get jwt token`);
    }
  }

  private async nearValidate(
    username: string,
    signedJsonString: string,
  ): Promise<boolean> {
    try {
      // Parameters:
      //   username: the NEAR accountId (e.g. test.near)
      //   signedJsonString: a json.stringify of the object {"signature", "publicKey"},
      //             where "signature" is the signature obtained after signing
      //             the user's username (e.g. test.near), and "publicKey" is
      //             the user's public key
      let { signature, publicKey } = JSON.parse(signedJsonString);

      // We expect the user to sign a message composed by its USERNAME
      const msg = Uint8Array.from(sha256.array(username));
      signature = Uint8Array.from(Object.values(signature));
      publicKey = Uint8Array.from(Object.values(publicKey.data));

      // check that the signature was created using the counterpart private key
      const valid_signature = nacl.sign.detached.verify(
        msg,
        signature,
        publicKey,
      );

      // and that the publicKey is from this USERNAME
      const pK_of_account = await this.nearValidatePublicKeyByAccountId(
        username,
        publicKey,
      );

      if (!valid_signature || !pK_of_account) return null;

      return true;
    } catch (error) {
      this.logger.error('AuthService - nearValidate', error);
      return false;
    }
  }

  private async nearValidatePublicKeyByAccountId(
    accountId: string,
    pkArray: string | Uint8Array,
  ): Promise<boolean> {
    try {
      const currentPublicKey = edsa + borsh.baseEncode(pkArray);
      const { url, payload, config } = getRpcPostArguments(
        accountId,
        this.configService.get('NODE_ENV'),
      );
      const result = await firstValueFrom(
        this.httpService.post(url, payload, config),
      );

      const data = result.data;

      if (!data || !data.result || !data.result.keys) return false;

      for (const key in data.result.keys) {
        if (data.result.keys[key].public_key === currentPublicKey) return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        'AuthService - nearValidatePublicKeyByAccountId',
        error,
      );
      return false;
    }
  }

  private async getOrCreateUser(username: string) {
    try {
      const user = await this.userService.findOne(username);

      if (!user) {
        const newUser = await this.userService.create({
          uid: username,
          accountType: 'near',
          nearWalletAccountId: username,
          username: username,
          roles: [Role.Customer],
        });

        return mapJwtUser(newUser);
      }
      return mapJwtUser(user);
    } catch (error) {
      this.logger.error('AuthService - getOrCreateUser', error);
      return null;
    }
  }
}
