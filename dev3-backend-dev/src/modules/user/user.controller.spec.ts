import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Project } from '../project/entities/project.entity';
import { File } from '../file/entities/file.entity';
import { ProjectService } from '../project/project.service';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserController,
        UserService,
        ProjectService,
        { provide: getModelToken(User.name), useValue: jest.fn() },
        { provide: getModelToken(File.name), useValue: jest.fn() },
        { provide: getModelToken(Project.name), useValue: jest.fn() },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
