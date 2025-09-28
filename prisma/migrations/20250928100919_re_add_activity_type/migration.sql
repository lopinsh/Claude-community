/*
  Warnings:

  - Added the required column `type` to the `activities` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('Online', 'InPerson', 'Hybrid', 'Other');

-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "type" "ActivityType" NOT NULL;
