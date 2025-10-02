import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive seed...');

  // Check if data already exists
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`Found ${existingUsers} existing users. Clearing database...`);

    // Clear existing data in correct order
    await prisma.eventAttendee.deleteMany();
    await prisma.eventTag.deleteMany();
    await prisma.event.deleteMany();
    await prisma.groupTag.deleteMany();
    await prisma.application.deleteMany();
    await prisma.groupMessage.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.tagSuggestion.deleteMany();
    await prisma.group.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    console.log('Database cleared!');
  }

  // Create demo users
  console.log('Creating demo users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      bio: 'Platform administrator',
      location: 'Rīga',
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      name: 'Alice Johnson',
      bio: 'Music enthusiast and choir singer',
      location: 'Rīga',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      name: 'Bob Smith',
      bio: 'Fitness coach and sports lover',
      location: 'Jūrmala',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'carol@example.com',
      password: hashedPassword,
      name: 'Carol Williams',
      bio: 'Language teacher and polyglot',
      location: 'Rīga',
    },
  });

  console.log(`Created ${4} demo users (password: password123)`);

  // Create 3-level taxonomy structure
  console.log('Creating taxonomy structure...');

  // Level 1: 6 main categories
  const skillCraft = await prisma.tag.create({
    data: { name: 'Skill & Craft', level: 1, status: 'ACTIVE' },
  });

  const movementWellness = await prisma.tag.create({
    data: { name: 'Movement & Wellness', level: 1, status: 'ACTIVE' },
  });

  const gatheringFun = await prisma.tag.create({
    data: { name: 'Gathering & Fun', level: 1, status: 'ACTIVE' },
  });

  const performanceSpectacle = await prisma.tag.create({
    data: { name: 'Performance & Spectacle', level: 1, status: 'ACTIVE' },
  });

  const civicGovernance = await prisma.tag.create({
    data: { name: 'Civic & Governance', level: 1, status: 'ACTIVE' },
  });

  const practicalResource = await prisma.tag.create({
    data: { name: 'Practical & Resource', level: 1, status: 'ACTIVE' },
  });

  // Level 2: Domains (under Skill & Craft)
  const musicInstruments = await prisma.tag.create({
    data: { name: 'Music & Instruments', parentId: skillCraft.id, level: 2, status: 'ACTIVE' },
  });

  const artsHandicrafts = await prisma.tag.create({
    data: { name: 'Arts & Handicrafts', parentId: skillCraft.id, level: 2, status: 'ACTIVE' },
  });

  const languagesLearning = await prisma.tag.create({
    data: { name: 'Languages & Learning', parentId: skillCraft.id, level: 2, status: 'ACTIVE' },
  });

  // Level 2: Domains (under Movement & Wellness)
  const teamSports = await prisma.tag.create({
    data: { name: 'Team Sports', parentId: movementWellness.id, level: 2, status: 'ACTIVE' },
  });

  const individualSports = await prisma.tag.create({
    data: { name: 'Individual Sports', parentId: movementWellness.id, level: 2, status: 'ACTIVE' },
  });

  const mindBody = await prisma.tag.create({
    data: { name: 'Mind-Body Practices', parentId: movementWellness.id, level: 2, status: 'ACTIVE' },
  });

  // Level 2: Domains (under Gathering & Fun)
  const socialGatherings = await prisma.tag.create({
    data: { name: 'Social Gatherings', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });

  const culturalEvents = await prisma.tag.create({
    data: { name: 'Cultural Events', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });

  // Level 2: Domains (under Performance & Spectacle)
  const musicPerformance = await prisma.tag.create({
    data: { name: 'Music Performance', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });

  const theater = await prisma.tag.create({
    data: { name: 'Theater & Drama', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });

  // Level 3: Specific tags
  const guitar = await prisma.tag.create({
    data: { name: 'Guitar', parentId: musicInstruments.id, level: 3, status: 'ACTIVE' },
  });

  const piano = await prisma.tag.create({
    data: { name: 'Piano', parentId: musicInstruments.id, level: 3, status: 'ACTIVE' },
  });

  const choir = await prisma.tag.create({
    data: { name: 'Choir', parentId: musicPerformance.id, level: 3, status: 'ACTIVE' },
  });

  const basketball = await prisma.tag.create({
    data: { name: 'Basketball', parentId: teamSports.id, level: 3, status: 'ACTIVE' },
  });

  const soccer = await prisma.tag.create({
    data: { name: 'Soccer', parentId: teamSports.id, level: 3, status: 'ACTIVE' },
  });

  const yoga = await prisma.tag.create({
    data: { name: 'Yoga', parentId: mindBody.id, level: 3, status: 'ACTIVE' },
  });

  const running = await prisma.tag.create({
    data: { name: 'Running', parentId: individualSports.id, level: 3, status: 'ACTIVE' },
  });

  const englishLanguage = await prisma.tag.create({
    data: { name: 'English', parentId: languagesLearning.id, level: 3, status: 'ACTIVE' },
  });

  const latvianLanguage = await prisma.tag.create({
    data: { name: 'Latvian', parentId: languagesLearning.id, level: 3, status: 'ACTIVE' },
  });

  console.log('Created taxonomy with 3 levels');

  // Create demo groups
  console.log('Creating demo groups...');

  const choirGroup = await prisma.group.create({
    data: {
      title: 'Rīga Community Choir',
      description: 'A friendly choir for all skill levels. We sing traditional Latvian songs and international classics. Join us every Tuesday evening!',
      location: 'Rīga, Brīvības iela 32',
      maxMembers: 50,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: user1.id,
      moderationStatus: 'APPROVED',
    },
  });

  const basketballGroup = await prisma.group.create({
    data: {
      title: 'Weekend Basketball Pickup',
      description: 'Casual basketball games every Saturday morning. All levels welcome! Bring your own water.',
      location: 'Rīga, Sporta halle, Skolas iela 15',
      maxMembers: 20,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: user2.id,
      moderationStatus: 'APPROVED',
    },
  });

  const languageGroup = await prisma.group.create({
    data: {
      title: 'English-Latvian Language Exchange',
      description: 'Practice English and Latvian in a relaxed cafe setting. Meet new people and improve your language skills!',
      location: 'Rīga, Café Osiris, Jauniela 16',
      maxMembers: 30,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: user3.id,
      moderationStatus: 'APPROVED',
    },
  });

  const yogaGroup = await prisma.group.create({
    data: {
      title: 'Morning Yoga in the Park',
      description: 'Start your day with gentle yoga in Vērmanes Garden. Suitable for beginners. Bring your own mat!',
      location: 'Rīga, Vērmanes dārzs',
      maxMembers: 25,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: user1.id,
      moderationStatus: 'APPROVED',
    },
  });

  const runningGroup = await prisma.group.create({
    data: {
      title: 'Rīga Running Club',
      description: 'Join us for group runs around the city. Different routes every week, all paces welcome.',
      location: 'Rīga, Meeting point: Freedom Monument',
      maxMembers: 40,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: user2.id,
      moderationStatus: 'APPROVED',
    },
  });

  console.log(`Created ${5} demo groups`);

  // Add tags to groups
  await prisma.groupTag.createMany({
    data: [
      { groupId: choirGroup.id, tagId: choir.id },
      { groupId: basketballGroup.id, tagId: basketball.id },
      { groupId: languageGroup.id, tagId: englishLanguage.id },
      { groupId: languageGroup.id, tagId: latvianLanguage.id },
      { groupId: yogaGroup.id, tagId: yoga.id },
      { groupId: runningGroup.id, tagId: running.id },
    ],
  });

  // Create events for groups
  console.log('Creating demo events...');

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await prisma.event.createMany({
    data: [
      {
        title: 'Weekly Choir Practice',
        description: 'Regular practice session',
        startDateTime: new Date(nextWeek.setHours(19, 0, 0, 0)),
        endDateTime: new Date(nextWeek.setHours(21, 0, 0, 0)),
        groupId: choirGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: 'Saturday Basketball Game',
        startDateTime: new Date(nextWeek.setHours(10, 0, 0, 0)),
        endDateTime: new Date(nextWeek.setHours(12, 0, 0, 0)),
        groupId: basketballGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: 'Language Exchange Meetup',
        startDateTime: new Date(twoWeeks.setHours(18, 0, 0, 0)),
        endDateTime: new Date(twoWeeks.setHours(20, 0, 0, 0)),
        groupId: languageGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: 'Morning Yoga Session',
        startDateTime: new Date(nextWeek.setHours(7, 0, 0, 0)),
        endDateTime: new Date(nextWeek.setHours(8, 0, 0, 0)),
        groupId: yogaGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: '5K Group Run',
        description: 'Easy-paced 5 kilometer run around Old Town',
        startDateTime: new Date(nextWeek.setHours(17, 30, 0, 0)),
        endDateTime: new Date(nextWeek.setHours(18, 30, 0, 0)),
        groupId: runningGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
    ],
  });

  console.log('Created demo events');

  // Create some applications (users joining groups)
  await prisma.application.createMany({
    data: [
      { userId: user2.id, groupId: choirGroup.id, status: 'ACCEPTED' },
      { userId: user3.id, groupId: choirGroup.id, status: 'ACCEPTED' },
      { userId: user1.id, groupId: basketballGroup.id, status: 'ACCEPTED' },
      { userId: user3.id, groupId: languageGroup.id, status: 'ACCEPTED' },
      { userId: user1.id, groupId: yogaGroup.id, status: 'ACCEPTED' },
      { userId: admin.id, groupId: choirGroup.id, status: 'PENDING' },
    ],
  });

  console.log('Created demo applications');

  console.log('\n✅ Comprehensive seed completed successfully!');
  console.log('\n📧 Demo accounts:');
  console.log('  - admin@example.com (Admin)');
  console.log('  - alice@example.com (Alice Johnson)');
  console.log('  - bob@example.com (Bob Smith)');
  console.log('  - carol@example.com (Carol Williams)');
  console.log('  - Password for all: password123');
  console.log('\n🎯 Created:');
  console.log(`  - 4 users`);
  console.log(`  - 6 Level 1 categories`);
  console.log(`  - 10 Level 2 domains`);
  console.log(`  - 9 Level 3 specific tags`);
  console.log(`  - 5 groups`);
  console.log(`  - 5 events`);
  console.log(`  - 6 group applications`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
