import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugAuth() {
  // Get the activity from the URL you shared
  const activityId = 'cmg4re03y00011434rqobxpap'
  const applicationId = 'cmg4re03y00011434rqobxpt1'

  console.log('=== Debugging Authorization Issue ===')

  // Check activity details
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      }
    }
  })

  console.log('Activity details:', {
    id: activity?.id,
    title: activity?.title,
    creator: activity?.creator
  })

  // Check application details
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      activity: {
        select: { id: true, title: true }
      }
    }
  })

  console.log('Application details:', {
    id: application?.id,
    status: application?.status,
    user: application?.user,
    activity: application?.activity
  })

  // List all users to see available options
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  })

  console.log('Available users:', users)

  await prisma.$disconnect()
}

debugAuth().catch(console.error)