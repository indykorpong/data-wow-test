import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateReservationDto } from './create-reservation.dto';

async function validateInput(input: Partial<CreateReservationDto>) {
  const dto = plainToInstance(CreateReservationDto, input);
  return validate(dto);
}

describe('CreateReservationDto', () => {
  it('passes with a valid UUID', async () => {
    const errors = await validateInput({
      concertId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    });

    expect(errors).toHaveLength(0);
  });

  it('fails when concertId is missing', async () => {
    const errors = await validateInput({});

    expect(errors.some((error) => error.property === 'concertId')).toBe(true);
  });

  it('fails when concertId is empty', async () => {
    const errors = await validateInput({ concertId: '' });

    expect(errors.some((error) => error.property === 'concertId')).toBe(true);
  });

  it('fails when concertId is not a valid UUID', async () => {
    const errors = await validateInput({ concertId: 'not-a-uuid' });

    expect(errors.some((error) => error.property === 'concertId')).toBe(true);
  });
});
