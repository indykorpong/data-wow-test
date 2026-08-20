-- CreateEnum
CREATE TYPE "ReservationAction" AS ENUM ('RESERVE', 'CANCEL');

-- CreateTable
CREATE TABLE "concerts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "concertId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "concertId" TEXT,
    "concertName" TEXT NOT NULL,
    "action" "ReservationAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reservation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reservations_concertId_idx" ON "reservations"("concertId");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_userId_concertId_key" ON "reservations"("userId", "concertId");

-- CreateIndex
CREATE INDEX "reservation_logs_userId_idx" ON "reservation_logs"("userId");

-- CreateIndex
CREATE INDEX "reservation_logs_concertId_idx" ON "reservation_logs"("concertId");

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_concertId_fkey" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_logs" ADD CONSTRAINT "reservation_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_logs" ADD CONSTRAINT "reservation_logs_concertId_fkey" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
