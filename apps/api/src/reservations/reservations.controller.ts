import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Roles(Role.USER)
  @Post()
  reserve(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.reserve(user, dto.concertId);
  }

  @Roles(Role.USER)
  @HttpCode(204)
  @Delete(':concertId')
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('concertId', ParseUUIDPipe) concertId: string,
  ) {
    return this.reservationsService.cancel(user, concertId);
  }

  @Roles(Role.USER)
  @Get('me')
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.reservationsService.findMine(user.userId);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.reservationsService.findAll();
  }
}
