// lib/notifications.ts
import { prisma } from '@/lib/prisma'
import { NotificationType } from '@prisma/client'

export async function createNotification({
  type,
  title,
  message,
  userId,
  activityId,
  applicationId,
  messageId,
}: {
  type: NotificationType
  title: string
  message?: string
  userId: string
  activityId?: string
  applicationId?: string
  messageId?: string
}) {
  try {
    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        userId,
        activityId,
        applicationId,
        messageId,
      },
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

// Helper functions for different notification types
export async function notifyNewApplication(
  organizerId: string, 
  applicantName: string, 
  activityTitle: string,
  applicationId: string,
  activityId: string
) {
  await createNotification({
    type: 'NEW_APPLICATION',
    title: 'New Application',
    message: `${applicantName} wants to join "${activityTitle}"`,
    userId: organizerId,
    activityId,
    applicationId,
  })
}

export async function notifyApplicationUpdate(
  applicantId: string,
  activityTitle: string,
  status: 'accepted' | 'declined',
  applicationId: string,
  activityId: string
) {
  const type = status === 'accepted' ? 'APPLICATION_ACCEPTED' : 'APPLICATION_DECLINED'
  const title = status === 'accepted' ? 'Application Accepted!' : 'Application Update'
  const message = `Your application to "${activityTitle}" was ${status}`

  await createNotification({
    type,
    title,
    message,
    userId: applicantId,
    activityId,
    applicationId,
  })
}

export async function notifyNewMessage(
  activityId: string,
  messageId: string,
  senderName: string,
  activityTitle: string,
  senderId: string
) {
  console.log('=== DEBUG notifyNewMessage ===')
  console.log('Activity ID:', activityId)
  console.log('Sender ID:', senderId)
  console.log('Sender Name:', senderName)
  console.log('Activity Title:', activityTitle)
  
  // Get all members of this activity (excluding the sender)
  const applications = await prisma.application.findMany({
    where: {
      activityId,
      status: 'accepted',
      userId: { not: senderId }
    },
    include: { user: true }
  })

  console.log('Found applications:', applications.length)
  console.log('Applications:', applications.map(app => ({ userId: app.userId, status: app.status })))

  // Also get the activity creator (if not the sender)
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { creator: true }
  })

  const recipients = [...applications.map(app => app.userId)]
  
  if (activity?.creatorId !== senderId) {
    recipients.push(activity!.creatorId)
  }

  console.log('Recipients:', recipients)

  // Create notification for each recipient
  for (const recipientId of recipients) {
    console.log('Creating notification for user:', recipientId)
    await createNotification({
      type: 'NEW_MESSAGE',
      title: 'New Message',
      message: `${senderName} posted in "${activityTitle}"`,
      userId: recipientId,
      activityId,
      messageId,
    })
  }

  console.log('=== END DEBUG notifyNewMessage ===')
}

export async function getUserNotifications(userId: string, limit = 20) {
  return await prisma.notification.findMany({
    where: { userId },
    include: {
      activity: {
        select: { id: true, title: true }
      },
      application: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  await prisma.notification.updateMany({
    where: { 
      id: notificationId,
      userId // Security: only mark own notifications as read
    },
    data: { isRead: true }
  })
}

export async function markAllNotificationsAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId },
    data: { isRead: true }
  })
}

export async function getUnreadNotificationCount(userId: string) {
  return await prisma.notification.count({
    where: { 
      userId,
      isRead: false 
    }
  })
}