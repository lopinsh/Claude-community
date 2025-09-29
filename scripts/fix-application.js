const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Akvalangists11@localhost:5432/community_platform?schema=public"
    }
  }
})

async function fixApplication() {
  console.log('=== Fixing Application Approval Issue ===')

  const applicationId = 'cmg4re03y00011434rqobxpt1'
  const activityId = 'cmg3vipi20001wbfxy25z1d1d'
  const yourUserId = 'cmg0m8mcq0000mwvhwxejbkk9' // ofeldmanis@gmail.com

  // Option 1: Change the activity creator to you so you can approve it
  console.log('🔄 Changing activity creator to you...')

  try {
    const updatedActivity = await prisma.activity.update({
      where: { id: activityId },
      data: { creatorId: yourUserId },
      include: {
        creator: { select: { name: true, email: true } }
      }
    })

    console.log(`✅ Activity creator changed to: ${updatedActivity.creator.name} (${updatedActivity.creator.email})`)

    // Now you can approve the application through the API since you're the creator
    console.log(`✅ You can now approve application ${applicationId} through the API`)
    console.log(`   Use: PATCH http://localhost:3000/api/activities/${activityId}/applications/${applicationId}`)
    console.log(`   Body: {"status": "accepted"}`)
    console.log(`   Make sure you're logged in as ofeldmanis@gmail.com`)

  } catch (error) {
    console.error('❌ Error fixing application:', error.message)

    // Option 2: Accept the application directly if changing creator fails
    console.log('\n🔄 Attempting to accept application directly...')
    try {
      const updatedApplication = await prisma.application.update({
        where: { id: applicationId },
        data: { status: 'accepted' }
      })

      console.log(`✅ Application status changed to: ${updatedApplication.status}`)
    } catch (directError) {
      console.error('❌ Error accepting application directly:', directError.message)
    }
  }

  await prisma.$disconnect()
}

fixApplication().catch(console.error)