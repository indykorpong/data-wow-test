/** A jest-mocked stand-in for `PrismaService`, shaped just enough for the
 *  concerts/reservations services under test. `$transaction` invokes its
 *  callback with the mock itself as `tx`, matching how the real Prisma
 *  client re-uses the same delegate shape inside a transaction. */
export type PrismaMock = {
  concert: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  reservation: {
    findMany: jest.Mock;
    count: jest.Mock;
    create: jest.Mock;
    delete: jest.Mock;
  };
  reservationLog: {
    findMany: jest.Mock;
    create: jest.Mock;
  };
  $transaction: jest.Mock;
};

export function createPrismaMock(): PrismaMock {
  const mock: PrismaMock = {
    concert: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    reservation: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    reservationLog: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  mock.$transaction.mockImplementation(
    (callback: (tx: PrismaMock) => unknown) => callback(mock),
  );

  return mock;
}
