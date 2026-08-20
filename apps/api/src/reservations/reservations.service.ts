import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReservationAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

export interface HistoryEntry {
  id: string;
  dateTime: string;
  username: string;
  concertName: string;
  action: 'reserve' | 'cancel';
}

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async reserve(user: AuthenticatedUser, concertId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const concert = await tx.concert.findUnique({ where: { id: concertId } });
      if (!concert) {
        throw new NotFoundException('Concert not found');
      }

      const activeCount = await tx.reservation.count({ where: { concertId } });
      if (activeCount >= concert.totalSeats) {
        throw new ConflictException('This concert is fully booked');
      }

      try {
        await tx.reservation.create({
          data: { userId: user.userId, concertId },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException(
            'You already have a reservation for this concert',
          );
        }
        throw error;
      }

      await tx.reservationLog.create({
        data: {
          userId: user.userId,
          username: user.fullName,
          concertId: concert.id,
          concertName: concert.name,
          action: ReservationAction.RESERVE,
        },
      });
    });
  }

  async cancel(user: AuthenticatedUser, concertId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const concert = await tx.concert.findUnique({ where: { id: concertId } });

      try {
        await tx.reservation.delete({
          where: { userId_concertId: { userId: user.userId, concertId } },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new NotFoundException('No active reservation for this concert');
        }
        throw error;
      }

      await tx.reservationLog.create({
        data: {
          userId: user.userId,
          username: user.fullName,
          concertId: concert?.id ?? null,
          concertName: concert?.name ?? 'Unknown concert',
          action: ReservationAction.CANCEL,
        },
      });
    });
  }

  async findMine(userId: string): Promise<HistoryEntry[]> {
    const logs = await this.prisma.reservationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return logs.map(toHistoryEntry);
  }

  async findAll(): Promise<HistoryEntry[]> {
    const logs = await this.prisma.reservationLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return logs.map(toHistoryEntry);
  }
}

function toHistoryEntry(log: {
  id: string;
  createdAt: Date;
  username: string;
  concertName: string;
  action: ReservationAction;
}): HistoryEntry {
  return {
    id: log.id,
    dateTime: log.createdAt.toISOString(),
    username: log.username,
    concertName: log.concertName,
    action: log.action === ReservationAction.RESERVE ? 'reserve' : 'cancel',
  };
}
