import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  concertId: string;
}
