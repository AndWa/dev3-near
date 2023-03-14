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
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { handle } from '../../helpers/response/handle';
import { AuthRequest } from '../user/entities/user.entity';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from './entities/address.entity';
import { HttpExceptionFilter } from '../../helpers/filters/http-exception.filter';
import { ApiPaginatedResponse } from '../../common/pagination/api-paginated-response';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard(['jwt', 'api-key']))
@ApiTags('address')
@Controller('address')
@ApiExtraModels(PaginatedDto)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Address })
  @ApiResponse({ status: 201, description: 'Address created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  @HttpCode(200)
  async create(@Req() request: AuthRequest, @Body() dto: CreateAddressDto) {
    dto.owner = request.user._id;
    return handle(await this.addressService.create(dto));
  }

  @Get()
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @UseFilters(new HttpExceptionFilter())
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'alias', required: false })
  @ApiPaginatedResponse(Address)
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findAll(
    @Req() request: AuthRequest,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('alias') alias?: string,
  ) {
    return handle(
      await this.addressService.findAll(request.user._id, offset, limit, alias),
    );
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Address })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findOne(@Req() request: AuthRequest, @Param('id') id: string) {
    return handle<Address>(
      await this.addressService.findOne(id, request.user._id.toString()),
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Address })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async update(
    @Req() request: AuthRequest,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateAddressDto,
  ) {
    return handle(
      await this.addressService.update(
        id,
        request.user._id.toString(),
        updateProjectDto,
      ),
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200, type: Address })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async remove(@Req() request: AuthRequest, @Param('id') id: string) {
    return handle(
      await this.addressService.remove(id, request.user._id.toString()),
    );
  }
}
