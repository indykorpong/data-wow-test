import { Controller, Get } from '@nestjs/common';
import { ReservationAction, Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Roles(Role.ADMIN)
  @Get('ping')
  ping() {
    return { message: 'pong', scope: 'admin-only' };
  }

  @Roles(Role.ADMIN)
  @Get('stats')
  async stats() {
    const [seatTotal, reserved, cancelled] = await Promise.all([
      this.prisma.concert.aggregate({ _sum: { totalSeats: true } }),
      this.prisma.reservation.count(),
      this.prisma.reservationLog.count({
        where: { action: ReservationAction.CANCEL },
      }),
    ]);

    return {
      totalSeats: seatTotal._sum.totalSeats ?? 0,
      reserved,
      cancelled,
    };
  }
}
