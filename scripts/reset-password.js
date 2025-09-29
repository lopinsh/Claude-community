const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Akvalangists11@localhost:5432/community_platform?schema=public"
    }
  }
})

async function resetPassword() {
  const email = 'ofeldmanis@gmail.com'
  const newPassword = 'TempPassword123!' // You can change this to whatever you want

  console.log(`=== Resetting password for ${email} ===`)

  // First, check if user exists
  const user = await prisma.user.findUnique({
    where: { email: email },
    select: { id: true, name: true, email: true }
  })

  if (!user) {
    console.log(`❌ User with email ${email} not found`)
    await prisma.$disconnect()
    return
  }

  console.log(`✅ Found user: ${user.name} (${user.email})`)

  // Hash the new password
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

  // Update the user's password
  try {
    await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword }
    })

    console.log(`✅ Password successfully updated for ${email}`)
    console.log(`🔑 New password: ${newPassword}`)
    console.log(`📧 User can now log in with email: ${email}`)

  } catch (error) {
    console.log(`❌ Error updating password:`, error.message)
  }

  await prisma.$disconnect()
}

resetPassword().catch(console.error)