import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { User, UserSchema } from '../user/entities/user.entity';
import { File, FileSchema } from '../file/entities/file.entity';
import { FileService } from './file.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { mockFile1, mockUser } from '../../../test/mock-tests-data';
import { Unauthorized } from '../../helpers/response/errors';
import { ConfigService } from '@nestjs/config';

describe('FileService', () => {
  let fileService: FileService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let userModel: Model<User>;
  let fileModel: Model<File>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    userModel = mongoConnection.model(User.name, UserSchema);
    fileModel = mongoConnection.model(File.name, FileSchema);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: getModelToken(File.name), useValue: fileModel },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'aws.bucket_name') {
                return 'dev3-bucket';
              }

              if (key === 'aws.region') {
                return 'us-west-1';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    fileService = module.get<FileService>(FileService);
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await mongod.stop();
  });

  afterEach(async () => {
    const collections = mongoConnection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  it(`Update - should return Unauthorized access to user file (Unauthorized - 401) exception`, async () => {
    const dataBuffer: any = [];
    await new userModel(mockUser).save();
    const createResult = await new fileModel(mockFile1).save();
    const response = await fileService.putFile(
      '123',
      createResult._id.toString(),
      dataBuffer,
      'name',
      'image/png',
    );
    expect(response).toStrictEqual(
      new Unauthorized('Unauthorized access to user file'),
    );
  });
});
