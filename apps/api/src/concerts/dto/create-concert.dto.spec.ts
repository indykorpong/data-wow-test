import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateConcertDto } from './create-concert.dto';

async function validateInput(input: Partial<CreateConcertDto>) {
  const dto = plainToInstance(CreateConcertDto, input);
  return validate(dto);
}

describe('CreateConcertDto', () => {
  it('passes with valid input', async () => {
    const errors = await validateInput({
      name: 'Rock Night',
      description: 'Loud music',
      totalSeats: 100,
    });

    expect(errors).toHaveLength(0);
  });

  it.each(['name', 'description'] as const)(
    'fails when %s is empty',
    async (field) => {
      const errors = await validateInput({
        name: 'Rock Night',
        description: 'Loud music',
        totalSeats: 100,
        [field]: '',
      });

      expect(errors.some((error) => error.property === field)).toBe(true);
    },
  );

  it.each([0, -1, 1.5])('fails when totalSeats is %s', async (totalSeats) => {
    const errors = await validateInput({
      name: 'Rock Night',
      description: 'Loud music',
      totalSeats,
    });

    expect(errors.some((error) => error.property === 'totalSeats')).toBe(true);
  });
});
