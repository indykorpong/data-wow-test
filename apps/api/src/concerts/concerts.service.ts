import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConcertDto } from './dto/create-concert.dto';

export interface ConcertSummary {
  id: string;
  name: string;
  description: string;
  totalSeats: number;
  reservedSeats: number;
  isReservedByMe: boolean;
}

@Injectable()
export class ConcertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllWithStats(userId: string): Promise<ConcertSummary[]> {
    const [concerts, myReservations] = await Promise.all([
      this.prisma.concert.findMany({
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { reservations: true } } },
      }),
      this.prisma.reservation.findMany({
        where: { userId },
        select: { concertId: true },
      }),
    ]);

    const reservedConcertIds = new Set(myReservations.map((r) => r.concertId));

    return concerts.map((concert) => ({
      id: concert.id,
      name: concert.name,
      description: concert.description,
      totalSeats: concert.totalSeats,
      reservedSeats: concert._count.reservations,
      isReservedByMe: reservedConcertIds.has(concert.id),
    }));
  }

  create(dto: CreateConcertDto) {
    return this.prisma.concert.create({ data: dto });
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.concert.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Concert not found');
      }
      throw error;
    }
  }
}
