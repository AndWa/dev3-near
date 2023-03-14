import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../helpers/filters/http-exception.filter';
import { TaskService } from './task.service';
import { StartCronJobDto } from './dto/start-cron-job.dto';
import { handle } from '../../helpers/response/handle';
import { CronJobDto } from './dto/cron-job.dto';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { RolesGuard } from '../auth/common/roles.guard';
import { Roles } from '../auth/common/roles.decorators';
import { Role } from '../../common/enums/role.enum';
import { SetCronTimeDto } from './dto/set-cron-time.dto';

@ApiTags('tasks')
@Controller('tasks')
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  @UseFilters(new HttpExceptionFilter())
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    type: [CronJobDto],
    description: 'Get all cron jobs',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async getAll() {
    return handle(this.taskService.getCrons());
  }

  @Post(':name/start')
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Boolean })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @HttpCode(200)
  async startCronJob(
    @Param('name') name: string,
    @Body() dto: StartCronJobDto,
  ) {
    return handle(await this.taskService.startCronJob(name, dto.start));
  }

  @Post(':name/set-time')
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Boolean })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @HttpCode(200)
  async setCrontTime(@Param('name') name: string, @Body() dto: SetCronTimeDto) {
    return handle(this.taskService.setCronJobTime(name, dto.cronTime));
  }

  @Get(':name')
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: CronJobDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findOne(@Param('name') name: string) {
    return handle(this.taskService.getCronJob(name));
  }
}
