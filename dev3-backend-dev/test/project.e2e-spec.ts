import { Test } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  mockProjects,
  mockAuthUser,
  mockCreateProjectDtos,
} from './mock-tests-data';
import { JwtAuthGuard } from '../src/modules/auth/common/jwt-auth.guard';
import { ServiceResult } from '../src/helpers/response/result';
import { Project } from '../src/modules/project/entities/project.entity';
import { PaginatedDto } from '../src/common/pagination/paginated-dto';
import { ProjectService } from '../src/modules/project/project.service';
import { ProjectModule } from '../src/modules/project/project.module';

describe('ProjectController (e2e)', () => {
  let app: INestApplication;
  const name = 'changed-name';
  const slug = 'koui';
  const updateProject = { ...mockProjects[0] };
  updateProject.name = name;
  updateProject.slug = slug;
  const projectService = {
    create: () => new ServiceResult<Project>(mockProjects[0]),
    findAll: () =>
      new ServiceResult<PaginatedDto<Project>>({
        total: 4,
        offset: 0,
        limit: 0,
        results: mockProjects,
      }),
    findOne: () => new ServiceResult<Project>(mockProjects[0]),
    findBySlug: () => new ServiceResult<Project>(mockProjects[0]),
    update: () => new ServiceResult<Project>(updateProject),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ProjectModule],
    })
      .overrideProvider(ProjectService)
      .useValue(projectService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = mockAuthUser;
          return true;
        },
      })

      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/project (POST) create', async () => {
    const response = await request(app.getHttpServer())
      .post('/project')
      .send(mockCreateProjectDtos[0]);
    expect(response.status).toEqual(200);
    expect(response.body._id).toEqual(
      projectService.create().data._id.toString(),
    );
  });

  it('/project (GET) all projects', async () => {
    const response = await request(app.getHttpServer()).get('/project');
    expect(response.status).toEqual(200);
    expect(response.body.results.length).toEqual(
      projectService.findAll().data.results.length,
    );
  });

  it('/project (GET) one', async () => {
    const id = '634ff1e4bb85ed5475a1ff5d';
    const response = await request(app.getHttpServer()).get(`/project/${id}`);
    expect(response.status).toEqual(200);
    expect(response.body._id).toEqual(id);
  });

  it('/project (GET) one with slug', async () => {
    const slug = 'slug-1234';
    const response = await request(app.getHttpServer()).get(
      `/project/slug/${slug}`,
    );
    expect(response.status).toEqual(200);
    expect(response.body.slug).toEqual(slug);
  });

  it('/address (PUT) one', async () => {
    const id = '634ff1e4bb85ed5475a1ff5d';
    const response = await request(app.getHttpServer())
      .patch(`/project/${id}`)
      .send({ name: name, slug: slug });
    expect(response.status).toEqual(200);
  });
});
