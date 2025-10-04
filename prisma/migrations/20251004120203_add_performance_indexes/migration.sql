-- CreateIndex
CREATE INDEX "group_tags_tagId_idx" ON "group_tags"("tagId");

-- CreateIndex
CREATE INDEX "group_tags_groupId_idx" ON "group_tags"("groupId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");
