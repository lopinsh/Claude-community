/*
  Warnings:

  - You are about to drop the column `type` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the `tag_relations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "tag_relations" DROP CONSTRAINT "tag_relations_childId_fkey";

-- DropForeignKey
ALTER TABLE "tag_relations" DROP CONSTRAINT "tag_relations_parentId_fkey";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "type";

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "parentId" TEXT;

-- DropTable
DROP TABLE "tag_relations";

-- DropEnum
DROP TYPE "ActivityType";

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;
