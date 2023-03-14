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
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '../../helpers/filters/http-exception.filter';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { DeployedContractService } from './deployed-contract.service';
import { DeployedContract } from './entities/deployed-contract.entity';
import { AuthRequest } from '../user/entities/user.entity';
import { CreateDeployedContractDto } from './dto/create-deployed-contract.dto';
import { handle, handleEmtpy } from '../../helpers/response/handle';
import { CommonApiResponse } from '../../helpers/decorators/api-response-swagger.decorator';
import { Auth } from '../../helpers/decorators/auth.decorator';
import { DeployedContractStatus } from '../../common/enums/deployed-contract-status.enum';
import { ApiPaginatedResponse } from '../../common/pagination/api-paginated-response';
import { Role } from '../../common/enums/role.enum';
import { DeployedContractDto } from './dto/deployed-contract.dto';
import { UpdateDeployedContractDto } from './dto/update-deployed-contract.dto';
import { ArrayPipe } from '../../helpers/pipes/array.pipe';

@ApiTags('deployed-contract')
@Controller('deployed-contract')
@ApiExtraModels(PaginatedDto)
export class DeployedContractController {
  constructor(
    private readonly deployedContractService: DeployedContractService,
  ) {}

  @Post()
  @Auth(Role.Customer)
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: DeployedContract })
  @CommonApiResponse()
  @HttpCode(200)
  async create(
    @Req() request: AuthRequest,
    @Body() dto: CreateDeployedContractDto,
  ) {
    dto.owner = request.user._id;
    return handle(await this.deployedContractService.create(dto));
  }

  @Get()
  @Auth(Role.Customer)
  @UseFilters(new HttpExceptionFilter())
  @ApiQuery({ name: 'project_id', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'alias', required: false })
  @ApiQuery({ name: 'contract_template_id', required: false })
  @ApiQuery({ name: 'status', enum: DeployedContractStatus, required: false })
  @ApiQuery({ name: 'tags', required: false, type: String, isArray: true })
  @ApiPaginatedResponse(DeployedContract)
  @CommonApiResponse()
  async findAll(
    @Req() request: AuthRequest,
    @Query('project_id') project_id?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('alias') alias?: string,
    @Query('status') status?: DeployedContractStatus,
    @Query('tags', ArrayPipe) tags?: string[],
  ) {
    return handle(
      await this.deployedContractService.findAll(
        request.user._id,
        offset,
        limit,
        project_id,
        alias,
        status,
        tags,
      ),
    );
  }

  @Get(':uuid')
  @Auth(Role.Customer)
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: DeployedContract })
  @CommonApiResponse()
  async findOne(@Req() request: AuthRequest, @Param('uuid') uuid: string) {
    return handle<DeployedContract>(
      await this.deployedContractService.findOne(
        uuid,
        request.user._id.toString(),
      ),
    );
  }

  @Get('public/:uuid')
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: DeployedContractDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findByUuidPublic(@Param('uuid') uuid: string) {
    return handle<DeployedContractDto>(
      await this.deployedContractService.findByUuid(uuid),
    );
  }

  @Patch(':uuid')
  @Auth(Role.Customer)
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: DeployedContractDto })
  @CommonApiResponse()
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDeployedContractDto: UpdateDeployedContractDto,
  ) {
    return handle(
      await this.deployedContractService.update(
        uuid,
        updateDeployedContractDto,
      ),
    );
  }

  @Delete(':uuid')
  @Auth(Role.Customer)
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 204 })
  @CommonApiResponse()
  async remove(@Req() request: AuthRequest, @Param('uuid') uuid: string) {
    return handleEmtpy(
      await this.deployedContractService.remove(
        uuid,
        request.user._id.toString(),
      ),
    );
  }
}
