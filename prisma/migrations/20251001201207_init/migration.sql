-- CreateEnum
CREATE TYPE "TagSuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED', 'MERGED');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('SINGLE_EVENT', 'RECURRING_GROUP');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('REGULAR', 'SPECIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('GOING', 'NOT_GOING', 'MAYBE');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_APPLICATION', 'APPLICATION_ACCEPTED', 'APPLICATION_DECLINED', 'NEW_MESSAGE', 'GROUP_UPDATE', 'EVENT_CREATED', 'EVENT_UPDATED', 'TAG_SUGGESTION_APPROVED', 'TAG_SUGGESTION_DENIED', 'TAG_SUGGESTION_MERGED');

-- CreateEnum
CREATE TYPE "TagStatus" AS ENUM ('ACTIVE', 'MERGED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "TagGroup" AS ENUM ('VERTICAL', 'HORIZONTAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pendingSuggestionCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "group" "TagGroup" NOT NULL DEFAULT 'VERTICAL',
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "status" "TagStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_suggestions" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameLv" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 3,
    "status" "TagSuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "parentTagIds" TEXT[],
    "suggestedById" TEXT NOT NULL,
    "moderatedById" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "moderatorNotes" TEXT,
    "mergedIntoTagId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tags" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_tags" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "maxMembers" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupType" "GroupType" NOT NULL DEFAULT 'SINGLE_EVENT',
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'APPROVED',
    "moderatedAt" TIMESTAMP(3),
    "moderatedBy" TEXT,
    "moderationNotes" TEXT,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "startDateTime" TIMESTAMP(3) NOT NULL,
    "endDateTime" TIMESTAMP(3),
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "timeZone" TEXT NOT NULL DEFAULT 'Europe/Riga',
    "eventType" "EventType" NOT NULL DEFAULT 'REGULAR',
    "weekDay" INTEGER,
    "visibility" "EventVisibility" NOT NULL DEFAULT 'PRIVATE',
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "maxMembers" INTEGER,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendees" (
    "id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'GOING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "group_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "groupId" TEXT,
    "applicationId" TEXT,
    "messageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tag_suggestions_status_idx" ON "tag_suggestions"("status");

-- CreateIndex
CREATE INDEX "tag_suggestions_suggestedById_status_idx" ON "tag_suggestions"("suggestedById", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_tags_eventId_tagId_key" ON "event_tags"("eventId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "group_tags_groupId_tagId_key" ON "group_tags"("groupId", "tagId");

-- CreateIndex
CREATE INDEX "groups_isActive_createdAt_idx" ON "groups"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "groups_location_idx" ON "groups"("location");

-- CreateIndex
CREATE INDEX "groups_creatorId_idx" ON "groups"("creatorId");

-- CreateIndex
CREATE INDEX "events_startDateTime_idx" ON "events"("startDateTime");

-- CreateIndex
CREATE INDEX "events_visibility_startDateTime_idx" ON "events"("visibility", "startDateTime");

-- CreateIndex
CREATE INDEX "events_groupId_startDateTime_idx" ON "events"("groupId", "startDateTime");

-- CreateIndex
CREATE INDEX "event_attendees_status_idx" ON "event_attendees"("status");

-- CreateIndex
CREATE INDEX "event_attendees_eventId_status_idx" ON "event_attendees"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendees_userId_eventId_key" ON "event_attendees"("userId", "eventId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_groupId_status_idx" ON "applications"("groupId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_groupId_key" ON "applications"("userId", "groupId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_suggestions" ADD CONSTRAINT "tag_suggestions_suggestedById_fkey" FOREIGN KEY ("suggestedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_tags" ADD CONSTRAINT "group_tags_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_tags" ADD CONSTRAINT "group_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "group_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
