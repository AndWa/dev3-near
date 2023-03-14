import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AddressModule } from './modules/address/address.module';
import { ApiKeyModule } from './modules/api-key/api-key.module';
import { AppModule } from './modules/app/app.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContractModule } from './modules/contract/contract.module';
import { DeployedContractModule } from './modules/deployed-contract/deployed-contract.module';
import { FileModule } from './modules/file/file.module';
import { ProjectModule } from './modules/project/project.module';
import { TasksModule } from './modules/task/task.module';
import { TransactionRequestModule } from './modules/transaction-request/tranasction-request.module';
import { UserModule } from './modules/user/user.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  app.setGlobalPrefix('api');

  app.enableVersioning({
    defaultVersion: '1',
    type: VersioningType.URI,
  });

  const configClient = new DocumentBuilder()
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'api-key', in: 'header' }, 'api-key')
    .setTitle('Dev3 client API')
    .setDescription('Dev3 platform API description')
    .setVersion('1.0')
    .build();

  const configAdmin = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Dev3 admin API')
    .setDescription('Dev3 platform API description')
    .setVersion('1.0')
    .build();

  const documentClient = SwaggerModule.createDocument(app, configClient, {
    include: [
      ProjectModule,
      AuthModule,
      UserModule,
      ApiKeyModule,
      AddressModule,
      ContractModule,
      DeployedContractModule,
      TransactionRequestModule,
      FileModule,
    ],
  });
  SwaggerModule.setup('swagger', app, documentClient);

  const documentAdmin = SwaggerModule.createDocument(app, configAdmin, {
    include: [TasksModule],
  });
  SwaggerModule.setup('swagger-admin', app, documentAdmin);

  await app.listen(configService.get('port'));
}
bootstrap();
