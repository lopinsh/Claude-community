const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Akvalangists11@localhost:5432/community_platform?schema=public"
    }
  }
})

async function findUser() {
  console.log('=== Searching for user ofeldmanis@gmail.com ===')

  // Search for exact match
  const exactUser = await prisma.user.findUnique({
    where: { email: 'ofeldmanis@gmail.com' }
  })

  if (exactUser) {
    console.log('✅ Found exact match:', exactUser)
  } else {
    console.log('❌ No exact match found')
  }

  // Search for similar emails (case insensitive, partial matches)
  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  })

  console.log('\n=== All users in database ===')
  allUsers.forEach(user => {
    console.log(`${user.name} - ${user.email} (ID: ${user.id})`)
  })

  // Look for potential matches
  const potentialMatches = allUsers.filter(user =>
    user.email.toLowerCase().includes('ofeldmanis') ||
    user.email.toLowerCase().includes('feldmanis') ||
    user.name?.toLowerCase().includes('feldmanis') ||
    user.name?.toLowerCase().includes('oskars')
  )

  if (potentialMatches.length > 0) {
    console.log('\n=== Potential matches ===')
    potentialMatches.forEach(user => {
      console.log(`${user.name} - ${user.email} (ID: ${user.id})`)
    })
  } else {
    console.log('\n❌ No potential matches found')
  }

  await prisma.$disconnect()
}

findUser().catch(console.error)