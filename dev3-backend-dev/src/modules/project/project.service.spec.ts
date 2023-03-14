import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockCreateProjectDtos,
  mockFile1,
  mockProjects,
  mockUser,
} from '../../../test/mock-tests-data';
import { ProjectService } from './project.service';
import { Project, ProjectSchema } from './entities/project.entity';
import { File, FileSchema } from '../file/entities/file.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from '../../helpers/response/errors';
import Mongoose from 'mongoose';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let projectModel: Model<Project>;
  let userModel: Model<User>;
  let fileModel: Model<File>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    projectModel = mongoConnection.model(Project.name, ProjectSchema);
    userModel = mongoConnection.model(User.name, UserSchema);
    fileModel = mongoConnection.model(File.name, FileSchema);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getModelToken(Project.name), useValue: projectModel },
        { provide: getModelToken(File.name), useValue: fileModel },
        { provide: getModelToken(User.name), useValue: userModel },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
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

  it('Create - should return the saved object', async () => {
    await new userModel(mockUser).save();
    await new fileModel(mockFile1).save();
    const createdProject = await projectService.create(
      mockCreateProjectDtos[0],
    );
    expect(createdProject.data.name).toBe(mockCreateProjectDtos[0].name);
    expect(createdProject.data.logo._id.toString()).toBe(
      mockCreateProjectDtos[0].logo_id.toString(),
    );
  });

  it('Create - should return the saved object with logo_id null if logo undefined', async () => {
    await new userModel(mockUser).save();
    const dto = { ...mockCreateProjectDtos[0] };
    delete dto.logo_id;
    const createdProject = await projectService.create(dto);
    expect(createdProject.data.name).toBe(mockCreateProjectDtos[0].name);
    expect(createdProject.data.logo).toBeNull();
  });

  it('Create - should return the saved object with logo_id null', async () => {
    await new userModel(mockUser).save();
    const dto = { ...mockCreateProjectDtos[0] };
    dto.logo_id = null;
    const createdProject = await projectService.create(dto);
    expect(createdProject.data.name).toBe(mockCreateProjectDtos[0].name);
    expect(createdProject.data.logo).toBeNull();
  });

  it(`Create - should return Name can't be empty (Bad Request - 400) exception`, async () => {
    const dto = { ...mockCreateProjectDtos[0] };
    delete dto.name;
    const response = await projectService.create(dto);
    expect(response).toStrictEqual(
      new BadRequest<Project>(`Name can't be empty`),
    );
  });

  it(`Create - should return Name isn't unique (Bad Request - 400) exception`, async () => {
    await new projectModel(mockCreateProjectDtos[0]).save();
    const response = await projectService.create(mockCreateProjectDtos[0]);
    expect(response).toStrictEqual(
      new BadRequest<Project>(
        `Name ${mockCreateProjectDtos[0].name} isn't unique`,
      ),
    );
  });

  it(`Create - should return Logo not found (Not Found - 404) exception`, async () => {
    const dto = { ...mockCreateProjectDtos[0] };
    dto.logo_id = '123';
    const response = await projectService.create(dto);
    expect(response).toStrictEqual(new NotFound<Project>(`Logo not found`));
  });

  it(`FindAll - should findAll`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockCreateProjectDtos[0]).save();
    await new projectModel(mockCreateProjectDtos[1]).save();
    const result = await projectService.findAll(mockUser._id);
    expect(result.data.results).toHaveLength(2);
  });

  it(`FindAll - should findAll with total count`, async () => {
    await new projectModel(mockCreateProjectDtos[0]).save();
    await new projectModel(mockCreateProjectDtos[1]).save();
    const result = await projectService.findAll(mockUser._id);
    expect(result.data.total).toEqual(2);
  });

  it(`FindAll - should findAll with total count, limit, offset`, async () => {
    await new projectModel(mockCreateProjectDtos[0]).save();
    await new projectModel(mockCreateProjectDtos[1]).save();
    await new projectModel(mockCreateProjectDtos[2]).save();
    await new projectModel(mockCreateProjectDtos[3]).save();
    const limit = 2;
    const offset = 2;
    const result = await projectService.findAll(mockUser._id, offset, limit);
    expect(result.data.total).toEqual(4);
    expect(result.data.offset).toEqual(offset);
    expect(result.data.limit).toEqual(limit);
    expect(result.data.count).toEqual(limit);
    expect(result.data.results).toHaveLength(limit);
  });

  it(`FindAll - should findAll with total count, limit, offset, filter by name, slug`, async () => {
    await new projectModel(mockCreateProjectDtos[0]).save();
    await new projectModel(mockCreateProjectDtos[1]).save();
    await new projectModel(mockCreateProjectDtos[2]).save();
    await new projectModel(mockCreateProjectDtos[3]).save();
    const limit = 2;
    const offset = 0;
    const name = 'project';
    const slug = 'slug';
    const result = await projectService.findAll(
      mockUser._id,
      offset,
      limit,
      name,
      slug,
    );
    expect(result.data.total).toEqual(2);
    expect(result.data.offset).toEqual(offset);
    expect(result.data.count).toEqual(limit);
    expect(result.data.limit).toEqual(limit);
    expect(result.data.results.length).toEqual(limit);
    expect(result.data.results[0].name).toMatch(mockCreateProjectDtos[1].name);
    expect(result.data.results[0].slug.includes(slug)).toBeTruthy();
    expect(result.data.results[1].name).toMatch(mockCreateProjectDtos[2].name);
    expect(result.data.results[1].slug.includes(slug)).toBeTruthy();
  });

  it(`FindOne - should findOne`, async () => {
    await new userModel(mockUser).save();

    const createResult = await new projectModel(
      mockCreateProjectDtos[0],
    ).save();

    const result = await projectService.findOne(
      createResult._id.toString(),
      mockUser._id.toString(),
    );

    expect(result.data.name).toBe(mockCreateProjectDtos[0].name);
  });

  it(`FindOne - should return Project not found (Not Found - 404) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const response = await projectService.findOne('12', user._id.toString());
    expect(response).toStrictEqual(new NotFound<Project>('Project not found'));
  });

  it(`FindOne - should return Project not found (Not Found - 404) exception`, async () => {
    const user = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const response = await projectService.findOne(
      '634ff1e4bb81ed5475a1ff6d',
      user._id.toString(),
    );
    expect(response).toStrictEqual(new NotFound<Project>('Project not found'));
  });

  it(`FindBySlug - should findBySlug`, async () => {
    await new userModel(mockUser).save();
    await new fileModel(mockFile1).save();
    const createResult = await new projectModel(mockProjects[0]).save();
    const result = await projectService.findBySlug(createResult.slug);
    expect(result.data.slug).toBe(createResult.slug);
    expect(result.data.logo_url).toBe(createResult.logo.url);
  });

  it(`FindBySlug - should findBySlug`, async () => {
    await new userModel(mockUser).save();
    await new fileModel(mockFile1).save();
    const slugProject = { ...mockProjects[0] };
    delete slugProject.logo;
    const createResult = await new projectModel(slugProject).save();
    const result = await projectService.findBySlug(createResult.slug);
    expect(result.data.slug).toBe(createResult.slug);
    expect(result.data.logo_url).toBe(null);
  });

  it(`FindBySlug - should return Project not found (Not Found - 404) exception`, async () => {
    await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const response = await projectService.findBySlug('12');
    expect(response).toStrictEqual(new NotFound<Project>('Project not found'));
  });

  it(`Update - should update`, async () => {
    const userResult = await new userModel(mockUser).save();
    const logo = await new fileModel(mockFile1).save();
    const createResult = await new projectModel(mockProjects[0]).save();
    const name = 'changed-name';
    const slug = 'koui';

    const result = await projectService.update(
      createResult._id.toString(),
      userResult._id.toString(),
      { name: name, slug: slug, logo_id: logo.id.toString() },
    );

    expect(result.data.name).toBe(name);
    expect(result.data.slug).toMatch(slug);
    expect(result.data.logo._id.toString()).toMatch(logo.id.toString());
  });

  it(`Update - should update without logo`, async () => {
    const userResult = await new userModel(mockUser).save();
    await new fileModel(mockFile1).save();
    const createResult = await new projectModel(mockProjects[0]).save();
    const name = 'changed-name';
    const slug = 'koui';

    const result = await projectService.update(
      createResult._id.toString(),
      userResult._id.toString(),
      { name: name, slug: slug },
    );

    expect(result.data.name).toBe(name);
    expect(result.data.slug).toMatch(slug);
    expect(result.data.logo._id.toString()).toMatch(
      createResult.logo._id.toString(),
    );
  });

  it(`Update - should update with name`, async () => {
    const userResult = await new userModel(mockUser).save();
    await new fileModel(mockFile1).save();
    const createResult = await new projectModel(mockProjects[0]).save();
    const name = 'changed-name';

    const result = await projectService.update(
      createResult._id.toString(),
      userResult._id.toString(),
      { name: name },
    );

    expect(result.data.name).toBe(name);
    expect(result.data.slug).toMatch(result.data.slug);
    expect(result.data.logo._id.toString()).toMatch(
      createResult.logo._id.toString(),
    );
  });

  it(`Update - should update with slug`, async () => {
    const userResult = await new userModel(mockUser).save();
    await new fileModel(mockFile1).save();
    const createResult = await new projectModel(mockProjects[0]).save();
    const slug = 'koui';

    const result = await projectService.update(
      createResult._id.toString(),
      userResult._id.toString(),
      { slug: slug },
    );

    expect(result.data.name).toBe(createResult.name);
    expect(result.data.slug).toMatch(slug);
    expect(result.data.logo._id.toString()).toMatch(
      createResult.logo._id.toString(),
    );
  });

  it(`Update - should leave existing slug`, async () => {
    const userResult = await new userModel(mockUser).save();
    await new fileModel(mockFile1).save();
    const createResult = await new projectModel(mockProjects[0]).save();
    const name = 'test';

    const result = await projectService.update(
      createResult._id.toString(),
      userResult._id.toString(),
      { name: name },
    );

    expect(result.data.name).toBe(name);
    expect(result.data.slug).toMatch(createResult.slug);
  });

  it(`Update - should update without logo`, async () => {
    const userResult = await new userModel(mockUser).save();
    await new fileModel(mockFile1).save();
    const createResult = await new projectModel(mockProjects[0]).save();

    const result = await projectService.update(
      createResult._id.toString(),
      userResult._id.toString(),
      { logo_id: null },
    );

    expect(result.data.name).toBe(createResult.name);
    expect(result.data.slug).toMatch(result.data.slug);
    expect(result.data.logo).toBeNull();
  });

  it(`Update - should return Project not found (Not Found - 404) exception`, async () => {
    const userResult = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const name = 'changed-name';
    const slug = 'koui';
    const response = await projectService.update(
      '12',
      userResult._id.toString(),
      {
        name: name,
        slug: slug,
      },
    );
    expect(response).toStrictEqual(new NotFound<Project>('Project not found'));
  });

  it(`Update - should return Project not found (Not Found - 404) exception`, async () => {
    const userResult = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const name = 'changed-name';
    const slug = 'koui';
    const response = await projectService.update(
      new Mongoose.Types.ObjectId().toString(),
      userResult._id.toString(),
      {
        name: name,
        slug: slug,
      },
    );
    expect(response).toStrictEqual(new NotFound<Project>('Project not found'));
  });

  it(`Update - should return Logo not found (Not Found - 404) exception`, async () => {
    const userResult = await new userModel(mockUser).save();
    await new projectModel(mockProjects[0]).save();
    const response = await projectService.update(
      mockProjects[0]._id.toString(),
      userResult._id.toString(),
      {
        logo_id: '123',
      },
    );
    expect(response).toStrictEqual(new NotFound<Project>('Logo not found'));
  });

  it(`Update - should return Unauthorized access to user project (Unauthorized - 401) exception`, async () => {
    await new userModel(mockUser).save();
    const createResult = await new projectModel(mockProjects[0]).save();
    const name = 'changed-name';
    const slug = 'koui';
    const response = await projectService.update(
      createResult._id.toString(),
      new Mongoose.Types.ObjectId().toString(),
      {
        name: name,
        slug: slug,
      },
    );
    expect(response).toStrictEqual(
      new Unauthorized('Unauthorized access to user project'),
    );
  });
});
