// Script to create admin user
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = 'ofeldmanis@gmail.com';
    const name = 'Oskars';
    const password = '123456';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user to ADMIN role
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          role: 'ADMIN',
          name,
          password: hashedPassword,
        },
      });

      console.log('✅ Updated existing user to ADMIN role:');
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   Role: ${updatedUser.role}`);
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      console.log('✅ Created new ADMIN user:');
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Name: ${newUser.name}`);
      console.log(`   Role: ${newUser.role}`);
    }

    console.log('\n✨ Admin user ready!');
    console.log('   You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
