import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthRequest, User } from './entities/user.entity';

@ApiTags('user')
@UseGuards(AuthGuard(['jwt', 'api-key']))
@Controller('user')
export class UserController {
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @Get('me')
  @ApiResponse({ status: 200, type: User })
  findMe(@Req() request: AuthRequest) {
    return request.user;
  }
}
