import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockProjects,
  mockAuthUser,
  mockCreateProjectDtos,
  mockUser,
  mockProjectDto,
} from '../../../test/mock-tests-data';
import { ServiceResult } from '../../helpers/response/result';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { Project } from './entities/project.entity';
import { File } from '../file/entities/file.entity';
import { BadRequest, NotFound } from '../../helpers/response/errors';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { ProjectDto } from './dto/project.dto';

describe('ProjectController', () => {
  let projectController: ProjectController;
  let projectService: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectController,
        ProjectService,
        { provide: getModelToken(Project.name), useValue: jest.fn() },
        { provide: getModelToken(File.name), useValue: jest.fn() },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
    projectController = module.get<ProjectController>(ProjectController);
  });

  describe('findAll', () => {
    it('should return all projects', async () => {
      const result = new ServiceResult<PaginatedDto<Project>>({
        total: 4,
        count: 4,
        limit: 0,
        offset: 0,
        results: mockProjects,
      });
      jest.spyOn(projectService, 'findAll').mockResolvedValue(result);
      const req: any = {
        user: mockAuthUser,
      };
      const response = await projectController.findAll(req);
      expect(response).toBe(result.data);
    });
  });

  describe('findById', () => {
    it('should return one project by id', async () => {
      const result = new ServiceResult<Project>(mockProjects[0]);
      jest.spyOn(projectService, 'findOne').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await projectController.findById(
        req,
        '634ff1e4bb85ed5475a1ff5d',
      );

      expect(response).toBe(result.data);
    });

    it('should return Project not found (Not Found - 404) exception', async () => {
      const result = new NotFound<Project>('Project not found');
      jest.spyOn(projectService, 'findOne').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await projectController.findById(req, '624ff1e4bb85ed5475a1ff5d');
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Project not found');
      }
    });
  });

  describe('findBySlug', () => {
    it('should return one project by slug', async () => {
      const result = new ServiceResult<ProjectDto>(mockProjectDto);
      jest.spyOn(projectService, 'findBySlug').mockResolvedValue(result);
      const response = await projectController.findBySlug('slug-1234');
      expect(response).toBe(result.data);
    });

    it('should return Project not found (Not Found - 404) exception', async () => {
      const result = new NotFound<ProjectDto>('Project not found');
      jest.spyOn(projectService, 'findBySlug').mockResolvedValue(result);
      try {
        await projectController.findBySlug('test');
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe('Project not found');
      }
    });
  });

  describe('create', () => {
    it('should create one project', async () => {
      const result = new ServiceResult<Project>(mockProjects[0]);
      jest.spyOn(projectService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await projectController.create(
        req,
        mockCreateProjectDtos[0],
      );
      expect(response).toBe(result.data);
    });

    it(`should return Name can't be empty (Bad request - 400) exception`, async () => {
      const dto = { ...mockCreateProjectDtos[0] };
      dto.name = undefined;
      const result = new BadRequest<Project>(`Name can't be empty`);
      jest.spyOn(projectService, 'create').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      try {
        await projectController.create(req, dto);
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.message).toBe(`Name can't be empty`);
      }
    });
  });

  describe('update', () => {
    it('should update one project', async () => {
      const name = 'changed-name';
      const slug = 'koui';
      const project = { ...mockProjects[0] };
      project.name = name;
      project.slug = slug;

      const result = new ServiceResult<Project>(project);
      jest.spyOn(projectService, 'update').mockResolvedValue(result);
      const req: any = {
        user: mockUser,
      };
      const response = await projectController.update(
        req,
        project._id.toString(),
        { name: name, slug: slug },
      );
      expect(response.name).toBe(name);
      expect(response.slug).toBe(slug);
    });
  });
});
