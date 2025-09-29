const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Akvalangists11@localhost:5432/community_platform?schema=public"
    }
  }
})

async function cleanup() {
  console.log('=== Cleaning up duplicate/test activities ===')

  // Remove duplicate activities but keep the one with applications
  const activitiesToDelete = [
    'cmg3twln70009b1yic7ku53rf', // Fun activity (no applications)
    'cmg3twvuo000cb1yiganllti3', // Fun activity (no applications)
    'cmg3tzqf8000fb1yi1d31darh', // sdfsf (no applications)
  ]

  for (const activityId of activitiesToDelete) {
    try {
      await prisma.activity.delete({
        where: { id: activityId }
      })
      console.log(`Deleted activity: ${activityId}`)
    } catch (error) {
      console.log(`Could not delete activity ${activityId}:`, error.message)
    }
  }

  console.log('\n=== Remaining activities ===')
  const remaining = await prisma.activity.findMany({
    include: {
      creator: { select: { name: true, email: true } },
      applications: {
        include: {
          user: { select: { name: true, email: true } }
        }
      }
    }
  })

  remaining.forEach(activity => {
    console.log(`${activity.title} (${activity.id})`)
    console.log(`  Creator: ${activity.creator.name}`)
    console.log(`  Applications: ${activity.applications.length}`)
  })

  await prisma.$disconnect()
}

cleanup().catch(console.error)