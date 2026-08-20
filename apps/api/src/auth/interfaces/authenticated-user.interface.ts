import { Role } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}
