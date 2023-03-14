import * as AdminJSMongoose from '@adminjs/mongoose';
import { Module, Scope } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import AdminJS from 'adminjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { PassportJwtDuplicationFixInterceptor } from './passport-fix.interceptor';
import { ProjectModule } from '../project/project.module';
import { MongooseSchemasModule } from './schemas.module';
import { UserModule } from '../user/user.module';
import { AddressModule } from '../address/address.module';
import { ContractModule } from '../contract/contract.module';
import { ApiKeyModule } from '../api-key/api-key.module';
import { configuration } from 'src/config/configuration';
import { existsSync } from 'fs';
import * as dotenv from 'dotenv';
import { envValidationSchema } from '../../config/validation';
import { TransactionRequestModule } from '../transaction-request/tranasction-request.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from '../task/task.module';
import { AdminJsModule } from '../admin-js/admin-js.module';
import { FileModule } from '../file/file.module';
import { DeployedContractModule } from '../deployed-contract/deployed-contract.module';

dotenv.config({
  path: existsSync(`.env.${process.env.NODE_ENV}`)
    ? `.env.${process.env.NODE_ENV}`
    : '.env',
});

AdminJS.registerAdapter(AdminJSMongoose);
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database_uri'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    ProjectModule,
    AuthModule,
    UserModule,
    AddressModule,
    ContractModule,
    DeployedContractModule,
    ApiKeyModule,
    TransactionRequestModule,
    TasksModule,
    FileModule,
    AdminJsModule,
    MongooseSchemasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      scope: Scope.REQUEST,
      useClass: PassportJwtDuplicationFixInterceptor,
    },
  ],
})
export class AppModule {}
