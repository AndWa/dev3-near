import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyModule } from '../api-key/api-key.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ApiKeyStrategy } from './common/api-key.strategy';
import { JwtStrategy } from './common/jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    HttpModule,
    ApiKeyModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expires_in') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, ApiKeyStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
