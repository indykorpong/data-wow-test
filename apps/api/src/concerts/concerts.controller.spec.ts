import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ConcertsController } from './concerts.controller';
import { ConcertsService } from './concerts.service';

const user: AuthenticatedUser = {
  userId: 'user-1',
  email: 'admin@example.com',
  fullName: 'Admin',
  role: Role.ADMIN,
};

describe('ConcertsController', () => {
  let controller: ConcertsController;
  let service: {
    findAllWithStats: jest.Mock;
    create: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAllWithStats: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConcertsController],
      providers: [{ provide: ConcertsService, useValue: service }],
    }).compile();

    controller = module.get(ConcertsController);
  });

  it('findAll delegates to the service with the current user id', async () => {
    const summaries = [{ id: 'concert-1' }];
    service.findAllWithStats.mockResolvedValue(summaries);

    const result = await controller.findAll(user);

    expect(service.findAllWithStats).toHaveBeenCalledWith(user.userId);
    expect(result).toBe(summaries);
  });

  it('create delegates to the service with the dto', async () => {
    const dto = { name: 'Show', description: 'Desc', totalSeats: 10 };
    const created = { id: 'concert-1', ...dto };
    service.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(created);
  });

  it('remove delegates to the service with the id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('concert-1');

    expect(service.remove).toHaveBeenCalledWith('concert-1');
  });
});
