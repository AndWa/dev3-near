import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/common/jwt-auth.guard';
import { Role } from '../../common/enums/role.enum';
import { RolesGuard } from '../../modules/auth/common/roles.guard';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
  );
}
