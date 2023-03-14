import { AdminModule } from '@adminjs/nestjs';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { dev3CompanyName, dev3LogoUrl } from '../../common/constants';
import { Address } from '../address/entities/address.entity';
import { ApiKey } from '../api-key/entities/api-key.entity';
import { MongooseSchemasModule } from '../app/schemas.module';
import { Contract } from '../contract/entities/contract.entity';
import { Project } from '../project/entities/project.entity';
import { TransactionRequest } from '../transaction-request/entities/transaction-request.entity';
import { User } from '../user/entities/user.entity';
import { File } from '../file/entities/file.entity';

export const AdminJsModule = AdminModule.createAdminAsync({
  imports: [MongooseSchemasModule],
  inject: [
    getModelToken('Project'),
    getModelToken('User'),
    getModelToken('Address'),
    getModelToken('Contract'),
    getModelToken('ApiKey'),
    getModelToken('TransactionRequest'),
    getModelToken('File'),
    ConfigService,
  ],
  useFactory: (
    projectModel: Model<Project>,
    userModel: Model<User>,
    addressModel: Model<Address>,
    contractModel: Model<Contract>,
    apiKeyModel: Model<ApiKey>,
    transactionRequestModel: Model<TransactionRequest>,
    fileModel: Model<File>,
    configService: ConfigService,
  ) => ({
    adminJsOptions: {
      rootPath: '/admin',
      resources: [
        {
          resource: projectModel,
          options: {
            properties: {
              createdAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              updatedAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              slug: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              owner: {
                isRequired: true,
                reference: 'User',
              },
            },
            parent: { name: 'Content', icon: 'Home' },
          },
        },
        {
          resource: userModel,
          options: {
            properties: {
              username: {
                isTitle: true,
              },
              createdAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              updatedAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
            },
            parent: { name: 'Content', icon: 'Home' },
          },
        },
        {
          resource: addressModel,
          options: {
            properties: {
              createdAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              updatedAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              owner: {
                isRequired: true,
                reference: 'User',
              },
            },
            parent: { name: 'Content', icon: 'Home' },
          },
        },
        {
          resource: contractModel,
          options: {
            properties: {
              createdAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              updatedAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
            },
            parent: { name: 'Content', icon: 'Home' },
          },
        },
        {
          resource: apiKeyModel,
          options: {
            properties: {
              createdAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              updatedAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
            },
            parent: { name: 'Content', icon: 'Home' },
          },
        },
        {
          resource: transactionRequestModel,
          options: {
            properties: {
              createdAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              updatedAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
            },
            parent: { name: 'Content', icon: 'Home' },
          },
        },
        {
          resource: fileModel,
          options: {
            properties: {
              createdAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
              updatedAt: {
                isVisible: {
                  edit: false,
                  new: false,
                },
              },
            },
            parent: { name: 'Content', icon: 'Home' },
          },
        },
      ],
      branding: {
        logo: dev3LogoUrl,
        companyName: dev3CompanyName,
        withMadeWithLove: false,
      },
    },
    auth: {
      authenticate: async (email: string, password: string) => {
        if (
          email === configService.get<string>('admin_js.admin_email') &&
          password === configService.get<string>('admin_js.admin_pass')
        ) {
          return Promise.resolve({
            email: configService.get<string>('admin_js.admin_email'),
            password: configService.get<string>('admin_js.admin_pass'),
          });
        }
        return null;
      },
      cookieName: configService.get<string>('admin_js.cookie_name'),
      cookiePassword: configService.get<string>('admin_js.cookie_pass'),
    },
    sessionOptions: {
      resave: false,
      saveUninitialized: true,
      secret: configService.get<string>('admin_js.cookie_pass'),
    },
  }),
});
