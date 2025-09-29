// scripts/create-test-user.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  console.log('Creating test user...')

  const email = 'test@example.com'
  const password = 'password123'
  const name = 'Test User'

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log('Test user already exists:', existingUser)
    return existingUser
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  })

  console.log('Test user created successfully:', user)
  console.log('Login credentials:')
  console.log('Email:', email)
  console.log('Password:', password)

  return user
}

createTestUser()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })