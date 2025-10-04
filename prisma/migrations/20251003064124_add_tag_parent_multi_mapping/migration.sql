-- CreateTable
CREATE TABLE "tag_parents" (
    "id" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "l1Category" TEXT NOT NULL,
    "l1ColorKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_parents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tag_parents_tagId_idx" ON "tag_parents"("tagId");

-- CreateIndex
CREATE INDEX "tag_parents_parentId_idx" ON "tag_parents"("parentId");

-- CreateIndex
CREATE INDEX "tag_parents_isPrimary_idx" ON "tag_parents"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "tag_parents_tagId_parentId_key" ON "tag_parents"("tagId", "parentId");

-- AddForeignKey
ALTER TABLE "tag_parents" ADD CONSTRAINT "tag_parents_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_parents" ADD CONSTRAINT "tag_parents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
