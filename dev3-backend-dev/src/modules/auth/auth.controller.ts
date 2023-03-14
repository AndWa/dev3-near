import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { handle } from '../../helpers/response/handle';
import { AuthService } from './auth.service';
import { NearLoginRequestDto } from './dto/near-login-request.dto';
import { NearLoginResponseDto } from './dto/near-login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/near')
  @ApiResponse({
    status: 200,
    description: 'The user has been logged in',
    type: NearLoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async nearLogin(@Body() data: NearLoginRequestDto) {
    return handle(
      await this.authService.getNearJwtToken(
        data.username,
        data.signedJsonString,
      ),
    );
  }
}
