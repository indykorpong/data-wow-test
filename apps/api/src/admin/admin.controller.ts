import { Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  @Roles(Role.ADMIN)
  @Get('ping')
  ping() {
    return { message: 'pong', scope: 'admin-only' };
  }
}
