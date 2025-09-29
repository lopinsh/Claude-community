const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Akvalangists11@localhost:5432/community_platform?schema=public"
    }
  }
})

async function createUser() {
  const email = 'ofeldmanis@gmail.com'
  const name = 'Oskars Feldmanis' // You can change this
  const password = 'TempPassword123!' // You can change this

  console.log(`=== Creating user ${email} ===`)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email }
  })

  if (existingUser) {
    console.log(`❌ User with email ${email} already exists`)
    await prisma.$disconnect()
    return
  }

  // Hash the password
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  // Create the user
  try {
    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password: hashedPassword
      }
    })

    console.log(`✅ User created successfully:`)
    console.log(`   ID: ${newUser.id}`)
    console.log(`   Name: ${newUser.name}`)
    console.log(`   Email: ${newUser.email}`)
    console.log(`🔑 Password: ${password}`)
    console.log(`📧 User can now log in with these credentials`)

  } catch (error) {
    console.log(`❌ Error creating user:`, error.message)
  }

  await prisma.$disconnect()
}

createUser().catch(console.error)