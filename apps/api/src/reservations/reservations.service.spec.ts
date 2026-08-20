import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, ReservationAction, Role } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';
import { ReservationsService } from './reservations.service';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

function knownRequestError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('mock error', {
    code,
    clientVersion: '6.2.1',
  });
}

const user: AuthenticatedUser = {
  userId: 'user-1',
  email: 'user@example.com',
  fullName: 'Test User',
  role: Role.USER,
};

const concert = {
  id: 'concert-1',
  name: 'Rock Night',
  description: 'Loud',
  totalSeats: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ReservationsService', () => {
  let service: ReservationsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ReservationsService);
  });

  describe('reserve', () => {
    it('creates a reservation and a RESERVE log when a seat is available', async () => {
      prisma.concert.findUnique.mockResolvedValue(concert);
      prisma.reservation.count.mockResolvedValue(0);
      prisma.reservation.create.mockResolvedValue({});
      prisma.reservationLog.create.mockResolvedValue({});

      await service.reserve(user, concert.id);

      expect(prisma.reservation.create).toHaveBeenCalledWith({
        data: { userId: user.userId, concertId: concert.id },
      });
      expect(prisma.reservationLog.create).toHaveBeenCalledWith({
        data: {
          userId: user.userId,
          username: user.fullName,
          concertId: concert.id,
          concertName: concert.name,
          action: ReservationAction.RESERVE,
        },
      });
    });

    it('throws NotFoundException when the concert does not exist', async () => {
      prisma.concert.findUnique.mockResolvedValue(null);

      await expect(service.reserve(user, 'missing')).rejects.toThrow(
        new NotFoundException('Concert not found'),
      );
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the concert is already fully booked', async () => {
      prisma.concert.findUnique.mockResolvedValue(concert);
      prisma.reservation.count.mockResolvedValue(concert.totalSeats);

      await expect(service.reserve(user, concert.id)).rejects.toThrow(
        new ConflictException('This concert is fully booked'),
      );
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });

    it('allows booking the last available seat', async () => {
      prisma.concert.findUnique.mockResolvedValue(concert);
      prisma.reservation.count.mockResolvedValue(concert.totalSeats - 1);
      prisma.reservation.create.mockResolvedValue({});
      prisma.reservationLog.create.mockResolvedValue({});

      await expect(service.reserve(user, concert.id)).resolves.toBeUndefined();
      expect(prisma.reservation.create).toHaveBeenCalled();
    });

    it('throws ConflictException when the user already has a reservation (P2002)', async () => {
      prisma.concert.findUnique.mockResolvedValue(concert);
      prisma.reservation.count.mockResolvedValue(0);
      prisma.reservation.create.mockRejectedValue(knownRequestError('P2002'));

      await expect(service.reserve(user, concert.id)).rejects.toThrow(
        new ConflictException(
          'You already have a reservation for this concert',
        ),
      );
      expect(prisma.reservationLog.create).not.toHaveBeenCalled();
    });

    it('rethrows unexpected errors from reservation creation', async () => {
      const unexpected = new Error('connection lost');
      prisma.concert.findUnique.mockResolvedValue(concert);
      prisma.reservation.count.mockResolvedValue(0);
      prisma.reservation.create.mockRejectedValue(unexpected);

      await expect(service.reserve(user, concert.id)).rejects.toBe(unexpected);
    });
  });

  describe('cancel', () => {
    it('deletes the reservation and writes a CANCEL log', async () => {
      prisma.concert.findUnique.mockResolvedValue(concert);
      prisma.reservation.delete.mockResolvedValue({});
      prisma.reservationLog.create.mockResolvedValue({});

      await service.cancel(user, concert.id);

      expect(prisma.reservation.delete).toHaveBeenCalledWith({
        where: {
          userId_concertId: { userId: user.userId, concertId: concert.id },
        },
      });
      expect(prisma.reservationLog.create).toHaveBeenCalledWith({
        data: {
          userId: user.userId,
          username: user.fullName,
          concertId: concert.id,
          concertName: concert.name,
          action: ReservationAction.CANCEL,
        },
      });
    });

    it('throws NotFoundException when there is no active reservation (P2025)', async () => {
      prisma.concert.findUnique.mockResolvedValue(concert);
      prisma.reservation.delete.mockRejectedValue(knownRequestError('P2025'));

      await expect(service.cancel(user, concert.id)).rejects.toThrow(
        new NotFoundException('No active reservation for this concert'),
      );
      expect(prisma.reservationLog.create).not.toHaveBeenCalled();
    });

    it('rethrows unexpected errors from reservation deletion', async () => {
      const unexpected = new Error('connection lost');
      prisma.concert.findUnique.mockResolvedValue(concert);
      prisma.reservation.delete.mockRejectedValue(unexpected);

      await expect(service.cancel(user, concert.id)).rejects.toBe(unexpected);
    });
  });

  describe('findMine / findAll', () => {
    const logs = [
      {
        id: 'log-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        username: 'Test User',
        concertName: 'Rock Night',
        action: ReservationAction.RESERVE,
      },
      {
        id: 'log-2',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        username: 'Test User',
        concertName: 'Rock Night',
        action: ReservationAction.CANCEL,
      },
    ];

    it('maps ReservationLog rows to HistoryEntry for the current user', async () => {
      prisma.reservationLog.findMany.mockResolvedValue(logs);

      const result = await service.findMine(user.userId);

      expect(prisma.reservationLog.findMany).toHaveBeenCalledWith({
        where: { userId: user.userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([
        {
          id: 'log-1',
          dateTime: '2026-01-01T00:00:00.000Z',
          username: 'Test User',
          concertName: 'Rock Night',
          action: 'reserve',
        },
        {
          id: 'log-2',
          dateTime: '2026-01-02T00:00:00.000Z',
          username: 'Test User',
          concertName: 'Rock Night',
          action: 'cancel',
        },
      ]);
    });

    it('maps ReservationLog rows to HistoryEntry for all users', async () => {
      prisma.reservationLog.findMany.mockResolvedValue(logs);

      const result = await service.findAll();

      expect(prisma.reservationLog.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].action).toBe('reserve');
      expect(result[1].action).toBe('cancel');
    });
  });
});
