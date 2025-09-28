/*
  Warnings:

  - You are about to drop the column `parentId` on the `tags` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tags" DROP CONSTRAINT "tags_parentId_fkey";

-- AlterTable
ALTER TABLE "tags" DROP COLUMN "parentId";

-- CreateTable
CREATE TABLE "tag_relations" (
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,

    CONSTRAINT "tag_relations_pkey" PRIMARY KEY ("parentId","childId")
);

-- AddForeignKey
ALTER TABLE "tag_relations" ADD CONSTRAINT "tag_relations_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_relations" ADD CONSTRAINT "tag_relations_childId_fkey" FOREIGN KEY ("childId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
