-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "endDateTime" TIMESTAMP(3),
ADD COLUMN     "isAllDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentEventId" TEXT,
ADD COLUMN     "recurrenceEnd" TIMESTAMP(3),
ADD COLUMN     "recurrenceRule" TEXT,
ADD COLUMN     "startDateTime" TIMESTAMP(3),
ADD COLUMN     "timeZone" TEXT;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_parentEventId_fkey" FOREIGN KEY ("parentEventId") REFERENCES "activities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
