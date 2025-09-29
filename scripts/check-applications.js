const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Akvalangists11@localhost:5432/community_platform?schema=public"
    }
  }
})

async function checkApplications() {
  console.log('=== Checking all applications ===')

  // Get all applications with user and activity details
  const applications = await prisma.application.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      activity: {
        include: {
          creator: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  })

  console.log(`Found ${applications.length} applications:\n`)

  applications.forEach((app, index) => {
    console.log(`Application ${index + 1}:`)
    console.log(`  ID: ${app.id}`)
    console.log(`  Status: ${app.status}`)
    console.log(`  User: ${app.user ? `${app.user.name} (${app.user.email})` : '❌ NULL/MISSING USER'}`)
    console.log(`  Activity: ${app.activity ? app.activity.title : '❌ NULL/MISSING ACTIVITY'}`)
    console.log(`  Activity Creator: ${app.activity?.creator ? `${app.activity.creator.name} (${app.activity.creator.email})` : '❌ NULL/MISSING CREATOR'}`)
    console.log(`  Created: ${app.createdAt}`)

    // Check for issues
    const issues = []
    if (!app.user) issues.push('Missing user')
    if (!app.activity) issues.push('Missing activity')
    if (!app.activity?.creator) issues.push('Missing activity creator')

    if (issues.length > 0) {
      console.log(`  🚨 ISSUES: ${issues.join(', ')}`)
    }

    console.log('')
  })

  // Check for orphaned applications (applications without valid users)
  const orphanedApps = applications.filter(app => !app.user)
  if (orphanedApps.length > 0) {
    console.log('=== ORPHANED APPLICATIONS (no valid user) ===')
    orphanedApps.forEach(app => {
      console.log(`- Application ID: ${app.id}, Activity: ${app.activity?.title || 'Unknown'}`)
    })
  }

  await prisma.$disconnect()
}

checkApplications().catch(console.error)