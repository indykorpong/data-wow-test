import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

const user: AuthenticatedUser = {
  userId: 'user-1',
  email: 'user@example.com',
  fullName: 'Test User',
  role: Role.USER,
};

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: {
    reserve: jest.Mock;
    cancel: jest.Mock;
    findMine: jest.Mock;
    findAll: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      reserve: jest.fn(),
      cancel: jest.fn(),
      findMine: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: service }],
    }).compile();

    controller = module.get(ReservationsController);
  });

  it('reserve delegates to the service with the current user and concertId', async () => {
    const dto: CreateReservationDto = { concertId: 'concert-1' };
    service.reserve.mockResolvedValue(undefined);

    await controller.reserve(user, dto);

    expect(service.reserve).toHaveBeenCalledWith(user, dto.concertId);
  });

  it('cancel delegates to the service with the current user and concertId', async () => {
    service.cancel.mockResolvedValue(undefined);

    await controller.cancel(user, 'concert-1');

    expect(service.cancel).toHaveBeenCalledWith(user, 'concert-1');
  });

  it('findMine delegates to the service with the current user id', async () => {
    const history = [{ id: 'log-1' }];
    service.findMine.mockResolvedValue(history);

    const result = await controller.findMine(user);

    expect(service.findMine).toHaveBeenCalledWith(user.userId);
    expect(result).toBe(history);
  });

  it('findAll delegates to the service', async () => {
    const history = [{ id: 'log-1' }, { id: 'log-2' }];
    service.findAll.mockResolvedValue(history);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toBe(history);
  });
});
