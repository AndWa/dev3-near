import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../common/pagination/api-paginated-response';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { HttpExceptionFilter } from '../../helpers/filters/http-exception.filter';
import { handle } from '../../helpers/response/handle';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { AuthRequest } from '../user/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectDto } from './dto/project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';

@ApiTags('project')
@Controller('project')
@ApiExtraModels(PaginatedDto)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Project })
  @ApiResponse({ status: 201, description: 'Project created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @HttpCode(200)
  async create(@Req() request: AuthRequest, @Body() dto: CreateProjectDto) {
    dto.owner = request.user._id;
    return handle(await this.projectService.create(dto));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'slug', required: false })
  @ApiPaginatedResponse(Project)
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findAll(
    @Req() request: AuthRequest,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('slug') slug?: string,
    @Query('name') name?: string,
  ) {
    return handle<PaginatedDto<Project>>(
      await this.projectService.findAll(
        request.user._id,
        offset,
        limit,
        name,
        slug,
      ),
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Project })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findById(@Req() request: AuthRequest, @Param('id') id: string) {
    return handle<Project>(
      await this.projectService.findOne(id, request.user._id.toString()),
    );
  }

  @Get('slug/:slug')
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: ProjectDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findBySlug(@Param('slug') slug: string) {
    return handle<ProjectDto>(await this.projectService.findBySlug(slug));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Project })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async update(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return handle(
      await this.projectService.update(id, request.user._id.toString(), dto),
    );
  }
}
