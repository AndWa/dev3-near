import {
  Body,
  Controller,
  Delete,
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
import { ApiBearerAuth, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { handle } from '../../helpers/response/handle';
import { HttpExceptionFilter } from '../../helpers/filters/http-exception.filter';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { AuthRequest } from '../user/entities/user.entity';
import { ApiKeyService } from './api-key.service';
import { ApiKeyDto } from './dto/api-key.dto';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { RevokeApiKeyDto } from './dto/revoke-api-key.dto';
import { RegenerateApiKeyDto } from './dto/regenerate-api-key.dto';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { ApiKey } from './entities/api-key.entity';

@UseGuards(JwtAuthGuard)
@ApiTags('api-key')
@Controller('api-key')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: ApiKeyDto })
  @ApiResponse({ status: 201, description: 'Api key created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @HttpCode(200)
  async create(@Req() request: AuthRequest, @Body() dto: CreateApiKeyDto) {
    dto.owner = request.user._id;
    return handle<ApiKeyDto>(await this.apiKeyService.create(dto));
  }

  @Get()
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'project_id', required: false })
  @ApiQuery({ name: 'api_key', required: false })
  @ApiResponse({ status: 200, type: PaginatedDto<ApiKeyDto> })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findAll(
    @Req() request: AuthRequest,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('project_id') project_id?: string,
    @Query('api_key') api_key?: string,
  ) {
    return handle(
      await this.apiKeyService.findAll(
        request.user._id,
        offset,
        limit,
        project_id,
        api_key,
      ),
    );
  }

  @Get(':projectId')
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: ApiKeyDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findOne(
    @Req() request: AuthRequest,
    @Param('projectId') projectId: string,
  ) {
    return handle<ApiKeyDto>(
      await this.apiKeyService.getFirstActive(
        projectId,
        request.user._id.toString(),
      ),
    );
  }

  @Get('is-valid/:apiKey')
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: ApiKeyDto })
  @ApiResponse({ status: 201, description: 'Api key created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @HttpCode(200)
  async isValid(@Param('apiKey') apiKey: string) {
    return handle<boolean>(await this.apiKeyService.isValid(apiKey));
  }

  @Patch('regenerate/:apiKey')
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: ApiKeyDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async regenerate(
    @Req() request: AuthRequest,
    @Param('apiKey') apiKey: string,
    @Body() dto: RegenerateApiKeyDto,
  ) {
    return handle(
      await this.apiKeyService.regenerate(
        apiKey,
        dto,
        request.user._id.toString(),
      ),
    );
  }

  @Patch('revoke/:apiKey')
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: ApiKeyDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async revoke(
    @Req() request: AuthRequest,
    @Param('apiKey') apiKey: string,
    @Body() dto: RevokeApiKeyDto,
  ) {
    return handle(
      await this.apiKeyService.revoke(apiKey, dto, request.user._id.toString()),
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: ApiKey })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async remove(@Req() request: AuthRequest, @Param('id') id: string) {
    return handle(
      await this.apiKeyService.remove(id, request.user._id.toString()),
    );
  }
}
