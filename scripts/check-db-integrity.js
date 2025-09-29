const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Akvalangists11@localhost:5432/community_platform?schema=public"
    }
  }
})

async function checkIntegrity() {
  console.log('=== Database Integrity Check ===')

  try {
    // Get raw applications data
    const rawApplications = await prisma.$queryRaw`
      SELECT id, "userId", "activityId", status, "createdAt"
      FROM "applications"
    `

    console.log('\n=== Raw Applications ===')
    rawApplications.forEach(app => {
      console.log(`App ID: ${app.id}, User ID: ${app.userId}, Activity ID: ${app.activityId}, Status: ${app.status}`)
    })

    // Check for missing users
    console.log('\n=== Checking for missing users ===')
    for (const app of rawApplications) {
      const user = await prisma.user.findUnique({
        where: { id: app.userId }
      })

      if (!user) {
        console.log(`❌ Application ${app.id} references non-existent user ${app.userId}`)
      } else {
        console.log(`✅ Application ${app.id} has valid user: ${user.name} (${user.email})`)
      }
    }

    // Check for missing activities
    console.log('\n=== Checking for missing activities ===')
    for (const app of rawApplications) {
      const activity = await prisma.activity.findUnique({
        where: { id: app.activityId }
      })

      if (!activity) {
        console.log(`❌ Application ${app.id} references non-existent activity ${app.activityId}`)
      } else {
        console.log(`✅ Application ${app.id} has valid activity: ${activity.title}`)
      }
    }

    // Check if there are any applications that can't be accepted due to API errors
    console.log('\n=== Testing application acceptance ===')
    for (const app of rawApplications) {
      if (app.status === 'pending') {
        console.log(`📋 Pending application ${app.id} can potentially be accepted`)

        // Get the activity to check creator
        const activity = await prisma.activity.findUnique({
          where: { id: app.activityId },
          include: { creator: true }
        })

        console.log(`   Activity creator: ${activity?.creator?.name} (${activity?.creator?.email})`)
        console.log(`   Required: Must be logged in as this creator to accept the application`)
      }
    }

  } catch (error) {
    console.error('Error during integrity check:', error)
  }

  await prisma.$disconnect()
}

checkIntegrity().catch(console.error)