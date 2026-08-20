import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test-utils/prisma-mock';
import { ConcertsService } from './concerts.service';

function knownRequestError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('mock error', {
    code,
    clientVersion: '6.2.1',
  });
}

describe('ConcertsService', () => {
  let service: ConcertsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConcertsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(ConcertsService);
  });

  describe('findAllWithStats', () => {
    it('maps reservation counts and flags concerts reserved by the current user', async () => {
      prisma.concert.findMany.mockResolvedValue([
        {
          id: 'concert-1',
          name: 'Rock Night',
          description: 'Loud',
          totalSeats: 100,
          _count: { reservations: 40 },
        },
        {
          id: 'concert-2',
          name: 'Jazz Evening',
          description: 'Chill',
          totalSeats: 50,
          _count: { reservations: 50 },
        },
      ]);
      prisma.reservation.findMany.mockResolvedValue([
        { concertId: 'concert-2' },
      ]);

      const result = await service.findAllWithStats('user-1');

      expect(result).toEqual([
        {
          id: 'concert-1',
          name: 'Rock Night',
          description: 'Loud',
          totalSeats: 100,
          reservedSeats: 40,
          isReservedByMe: false,
        },
        {
          id: 'concert-2',
          name: 'Jazz Evening',
          description: 'Chill',
          totalSeats: 50,
          reservedSeats: 50,
          isReservedByMe: true,
        },
      ]);
      expect(prisma.reservation.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: { concertId: true },
      });
    });
  });

  describe('create', () => {
    it('delegates to prisma.concert.create with the dto', async () => {
      const dto = { name: 'New Show', description: 'Fresh', totalSeats: 10 };
      const created = { id: 'concert-3', ...dto };
      prisma.concert.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(prisma.concert.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toBe(created);
    });
  });

  describe('remove', () => {
    it('deletes the concert by id', async () => {
      prisma.concert.delete.mockResolvedValue(undefined);

      await service.remove('concert-1');

      expect(prisma.concert.delete).toHaveBeenCalledWith({
        where: { id: 'concert-1' },
      });
    });

    it('throws NotFoundException when the concert does not exist (P2025)', async () => {
      prisma.concert.delete.mockRejectedValue(knownRequestError('P2025'));

      await expect(service.remove('missing')).rejects.toThrow(
        new NotFoundException('Concert not found'),
      );
    });

    it('rethrows unexpected errors unchanged', async () => {
      const unexpected = new Error('connection lost');
      prisma.concert.delete.mockRejectedValue(unexpected);

      await expect(service.remove('concert-1')).rejects.toBe(unexpected);
    });
  });
});
