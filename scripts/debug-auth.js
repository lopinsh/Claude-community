const { PrismaClient } = require('@prisma/client')

// Use localhost for the connection since we're running outside of Docker
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Akvalangists11@localhost:5432/community_platform?schema=public"
    }
  }
})

async function debugAuth() {
  console.log('=== Database Cleanup and Investigation ===')

  // List all activities with their creators
  const activities = await prisma.activity.findMany({
    include: {
      creator: {
        select: { id: true, name: true, email: true }
      },
      applications: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  })

  console.log('\n=== ALL ACTIVITIES ===')
  activities.forEach(activity => {
    console.log(`Activity: ${activity.title} (ID: ${activity.id})`)
    console.log(`  Creator: ${activity.creator.name} (${activity.creator.email})`)
    console.log(`  Applications: ${activity.applications.length}`)
    activity.applications.forEach(app => {
      console.log(`    - ${app.user.name} (${app.user.email}) - Status: ${app.status} - ID: ${app.id}`)
    })
    console.log('')
  })

  // List all users
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  })

  console.log('=== ALL USERS ===')
  users.forEach(user => {
    console.log(`${user.name} (${user.email}) - ID: ${user.id}`)
  })

  await prisma.$disconnect()
}

debugAuth().catch(console.error)