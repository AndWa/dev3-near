import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
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
import { HttpExceptionFilter } from '../../helpers/filters/http-exception.filter';
import { PaginatedDto } from '../../common/pagination/paginated-dto';
import { JwtAuthGuard } from '../auth/common/jwt-auth.guard';
import { ContractService } from './contract.service';
import { handle } from '../../helpers/response/handle';
import { ContractDto } from './dto/contract.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { BooleanPipe } from 'src/helpers/pipes/boolean.pipe';

@ApiTags('contract-template')
@Controller('contract-template')
@ApiExtraModels(PaginatedDto)
export class ContractController {
  private readonly logger = new Logger(ContractController.name);
  constructor(
    private readonly contractService: ContractService,
    private configService: ConfigService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseFilters(new HttpExceptionFilter())
  @ApiQuery({ name: 'offset', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'isAudited', required: false })
  @ApiResponse({ status: 200, type: PaginatedDto<ContractDto> })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async findAll(
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('name') name?: string,
    @Query('isAudited', BooleanPipe) isAudited?: boolean,
  ) {
    return handle<PaginatedDto<ContractDto>>(
      await this.contractService.findAll(offset, limit, name, isAudited),
    );
  }

  @Post('update-contracts')
  @UseFilters(new HttpExceptionFilter())
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async updateContracts(@Req() req, @Res() res: Response) {
    try {
      const { createHmac, timingSafeEqual } = await import('crypto');
      const sigHeaderName = 'X-Hub-Signature-256';
      const sigHashAlg = 'sha256';

      const data = JSON.stringify(req.body);
      const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
      const hmac = createHmac(
        sigHashAlg,
        this.configService.get<string>('github.webhook_secret'),
      );
      const digest = Buffer.from(
        `${sigHashAlg}=${hmac.update(data).digest('hex')}`,
        'utf8',
      );
      if (sig.length !== digest.length || !timingSafeEqual(digest, sig)) {
        throw new UnauthorizedException();
      }

      await this.contractService.saveContracts();
      return res.status(HttpStatus.OK).send();
    } catch (error) {
      this.logger.error('ContractController - updateContracts', error);
      throw new InternalServerErrorException();
    }
  }
}
