import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ConcertsService } from './concerts.service';
import { CreateConcertDto } from './dto/create-concert.dto';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.concertsService.findAllWithStats(user.userId);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateConcertDto) {
    return this.concertsService.create(dto);
  }

  @Roles(Role.ADMIN)
  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.concertsService.remove(id);
  }
}
