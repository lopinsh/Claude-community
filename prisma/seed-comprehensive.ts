import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive seed with proper category structure...');

  // Clear existing data
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`Found ${existingUsers} existing users. Clearing database...`);
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

  // ==================== USERS ====================
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

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      name: 'Alice Johnson',
      bio: 'Music enthusiast and choir singer',
      location: 'Rīga',
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      name: 'Bob Smith',
      bio: 'Fitness coach and sports lover',
      location: 'Jūrmala',
    },
  });

  const carol = await prisma.user.create({
    data: {
      email: 'carol@example.com',
      password: hashedPassword,
      name: 'Carol Williams',
      bio: 'Language teacher and polyglot',
      location: 'Rīga',
    },
  });

  console.log(`✅ Created 4 demo users`);

  // ==================== LEVEL 1 CATEGORIES ====================
  console.log('Creating Level 1 categories (6 main categories)...');

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

  console.log(`✅ Created 6 Level 1 categories`);

  // ==================== LEVEL 2: SKILL & CRAFT ====================
  console.log('Creating Level 2 domains...');

  // Skill & Craft domains
  const musicInstruments = await prisma.tag.create({
    data: { name: 'Music & Instruments', parentId: skillCraft.id, level: 2, status: 'ACTIVE' },
  });

  const artsHandicrafts = await prisma.tag.create({
    data: { name: 'Arts & Handicrafts', parentId: skillCraft.id, level: 2, status: 'ACTIVE' },
  });

  const languagesLearning = await prisma.tag.create({
    data: { name: 'Languages & Learning', parentId: skillCraft.id, level: 2, status: 'ACTIVE' },
  });

  const techDigital = await prisma.tag.create({
    data: { name: 'Tech & Digital', parentId: skillCraft.id, level: 2, status: 'ACTIVE' },
  });

  // Movement & Wellness domains
  const teamSports = await prisma.tag.create({
    data: { name: 'Team Sports', parentId: movementWellness.id, level: 2, status: 'ACTIVE' },
  });

  const individualSports = await prisma.tag.create({
    data: { name: 'Individual Sports', parentId: movementWellness.id, level: 2, status: 'ACTIVE' },
  });

  const mindBody = await prisma.tag.create({
    data: { name: 'Mind-Body Practices', parentId: movementWellness.id, level: 2, status: 'ACTIVE' },
  });

  const outdoorAdventure = await prisma.tag.create({
    data: { name: 'Outdoor & Adventure', parentId: movementWellness.id, level: 2, status: 'ACTIVE' },
  });

  // Gathering & Fun domains
  const socialGatherings = await prisma.tag.create({
    data: { name: 'Social Gatherings', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });

  const culturalEvents = await prisma.tag.create({
    data: { name: 'Cultural Events', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });

  const foodDrink = await prisma.tag.create({
    data: { name: 'Food & Drink', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });

  // Performance & Spectacle domains
  const musicPerformance = await prisma.tag.create({
    data: { name: 'Music Performance', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });

  const theaterDrama = await prisma.tag.create({
    data: { name: 'Theater & Drama', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });

  const dancePerformance = await prisma.tag.create({
    data: { name: 'Dance Performance', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });

  // Civic & Governance domains
  const communityOrganizing = await prisma.tag.create({
    data: { name: 'Community Organizing', parentId: civicGovernance.id, level: 2, status: 'ACTIVE' },
  });

  const volunteerCharity = await prisma.tag.create({
    data: { name: 'Volunteer & Charity', parentId: civicGovernance.id, level: 2, status: 'ACTIVE' },
  });

  // Practical & Resource domains
  const skillsWorkshops = await prisma.tag.create({
    data: { name: 'Skills & Workshops', parentId: practicalResource.id, level: 2, status: 'ACTIVE' },
  });

  const exchangeSharing = await prisma.tag.create({
    data: { name: 'Exchange & Sharing', parentId: practicalResource.id, level: 2, status: 'ACTIVE' },
  });

  console.log(`✅ Created 18 Level 2 domains`);

  // ==================== LEVEL 3: SPECIFIC TAGS ====================
  console.log('Creating Level 3 specific tags...');

  // Music & Instruments
  const guitar = await prisma.tag.create({
    data: { name: 'Guitar', parentId: musicInstruments.id, level: 3, status: 'ACTIVE' },
  });
  const piano = await prisma.tag.create({
    data: { name: 'Piano', parentId: musicInstruments.id, level: 3, status: 'ACTIVE' },
  });
  const singing = await prisma.tag.create({
    data: { name: 'Singing', parentId: musicInstruments.id, level: 3, status: 'ACTIVE' },
  });

  // Languages
  const english = await prisma.tag.create({
    data: { name: 'English', parentId: languagesLearning.id, level: 3, status: 'ACTIVE' },
  });
  const latvian = await prisma.tag.create({
    data: { name: 'Latvian', parentId: languagesLearning.id, level: 3, status: 'ACTIVE' },
  });
  const russian = await prisma.tag.create({
    data: { name: 'Russian', parentId: languagesLearning.id, level: 3, status: 'ACTIVE' },
  });

  // Team Sports
  const basketball = await prisma.tag.create({
    data: { name: 'Basketball', parentId: teamSports.id, level: 3, status: 'ACTIVE' },
  });
  const soccer = await prisma.tag.create({
    data: { name: 'Soccer', parentId: teamSports.id, level: 3, status: 'ACTIVE' },
  });
  const volleyball = await prisma.tag.create({
    data: { name: 'Volleyball', parentId: teamSports.id, level: 3, status: 'ACTIVE' },
  });

  // Individual Sports
  const running = await prisma.tag.create({
    data: { name: 'Running', parentId: individualSports.id, level: 3, status: 'ACTIVE' },
  });
  const cycling = await prisma.tag.create({
    data: { name: 'Cycling', parentId: individualSports.id, level: 3, status: 'ACTIVE' },
  });
  const swimming = await prisma.tag.create({
    data: { name: 'Swimming', parentId: individualSports.id, level: 3, status: 'ACTIVE' },
  });

  // Mind-Body
  const yoga = await prisma.tag.create({
    data: { name: 'Yoga', parentId: mindBody.id, level: 3, status: 'ACTIVE' },
  });
  const meditation = await prisma.tag.create({
    data: { name: 'Meditation', parentId: mindBody.id, level: 3, status: 'ACTIVE' },
  });

  // Outdoor & Adventure
  const hiking = await prisma.tag.create({
    data: { name: 'Hiking', parentId: outdoorAdventure.id, level: 3, status: 'ACTIVE' },
  });

  // Music Performance
  const choir = await prisma.tag.create({
    data: { name: 'Choir', parentId: musicPerformance.id, level: 3, status: 'ACTIVE' },
  });
  const band = await prisma.tag.create({
    data: { name: 'Band', parentId: musicPerformance.id, level: 3, status: 'ACTIVE' },
  });

  // Social Gatherings
  const meetups = await prisma.tag.create({
    data: { name: 'Meetups', parentId: socialGatherings.id, level: 3, status: 'ACTIVE' },
  });
  const bookClub = await prisma.tag.create({
    data: { name: 'Book Club', parentId: socialGatherings.id, level: 3, status: 'ACTIVE' },
  });

  // Food & Drink
  const cooking = await prisma.tag.create({
    data: { name: 'Cooking', parentId: foodDrink.id, level: 3, status: 'ACTIVE' },
  });

  console.log(`✅ Created 21 Level 3 specific tags`);

  // ==================== GROUPS ====================
  console.log('Creating demo groups...');

  const choirGroup = await prisma.group.create({
    data: {
      title: 'Rīga Community Choir',
      description: 'A friendly choir for all skill levels. We sing traditional Latvian songs and international classics. Join us every Tuesday evening!',
      location: 'Rīga, Brīvības iela 32',
      maxMembers: 50,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: alice.id,
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
      creatorId: bob.id,
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
      creatorId: carol.id,
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
      creatorId: alice.id,
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
      creatorId: bob.id,
      moderationStatus: 'APPROVED',
    },
  });

  const bookClubGroup = await prisma.group.create({
    data: {
      title: 'Rīga Book Club',
      description: 'Monthly discussions of fiction and non-fiction. Currently reading contemporary Latvian authors.',
      location: 'Rīga, National Library',
      maxMembers: 15,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: carol.id,
      moderationStatus: 'APPROVED',
    },
  });

  console.log(`✅ Created 6 demo groups`);

  // ==================== TAG GROUPS (Link groups to tags) ====================
  console.log('Linking groups to tags...');

  await prisma.groupTag.createMany({
    data: [
      // Choir - Performance & Spectacle > Music Performance > Choir
      { groupId: choirGroup.id, tagId: choir.id },
      { groupId: choirGroup.id, tagId: singing.id },

      // Basketball - Movement & Wellness > Team Sports > Basketball
      { groupId: basketballGroup.id, tagId: basketball.id },

      // Language Exchange - Skill & Craft > Languages & Learning > English, Latvian
      { groupId: languageGroup.id, tagId: english.id },
      { groupId: languageGroup.id, tagId: latvian.id },

      // Yoga - Movement & Wellness > Mind-Body > Yoga
      { groupId: yogaGroup.id, tagId: yoga.id },

      // Running - Movement & Wellness > Individual Sports > Running
      { groupId: runningGroup.id, tagId: running.id },

      // Book Club - Gathering & Fun > Social Gatherings > Book Club
      { groupId: bookClubGroup.id, tagId: bookClub.id },
    ],
  });

  console.log(`✅ Linked groups to tags`);

  // ==================== EVENTS ====================
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
      {
        title: 'Monthly Book Discussion',
        description: 'Discussing "The Wall" by Marlen Haushofer',
        startDateTime: new Date(twoWeeks.setHours(19, 0, 0, 0)),
        endDateTime: new Date(twoWeeks.setHours(21, 0, 0, 0)),
        groupId: bookClubGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
    ],
  });

  console.log(`✅ Created 6 demo events`);

  // ==================== APPLICATIONS ====================
  console.log('Creating demo applications...');

  await prisma.application.createMany({
    data: [
      { userId: bob.id, groupId: choirGroup.id, status: 'ACCEPTED' },
      { userId: carol.id, groupId: choirGroup.id, status: 'ACCEPTED' },
      { userId: alice.id, groupId: basketballGroup.id, status: 'ACCEPTED' },
      { userId: carol.id, groupId: languageGroup.id, status: 'ACCEPTED' },
      { userId: bob.id, groupId: yogaGroup.id, status: 'ACCEPTED' },
      { userId: admin.id, groupId: choirGroup.id, status: 'PENDING' },
      { userId: alice.id, groupId: bookClubGroup.id, status: 'ACCEPTED' },
    ],
  });

  console.log(`✅ Created 7 demo applications`);

  console.log('\n✅ COMPREHENSIVE SEED COMPLETED!');
  console.log('\n📊 Summary:');
  console.log('  ├─ 4 users');
  console.log('  ├─ 6 Level 1 categories (Skill & Craft, Movement & Wellness, etc.)');
  console.log('  ├─ 18 Level 2 domains');
  console.log('  ├─ 21 Level 3 specific tags');
  console.log('  ├─ 6 groups');
  console.log('  ├─ 6 events');
  console.log('  └─ 7 applications');
  console.log('\n🎨 Category Colors:');
  console.log('  ├─ Skill & Craft → Teal (Choir uses this via Music Performance)');
  console.log('  ├─ Movement & Wellness → Green (Basketball, Yoga, Running)');
  console.log('  ├─ Gathering & Fun → Peach (Book Club)');
  console.log('  ├─ Performance & Spectacle → Blue (Choir)');
  console.log('  ├─ Civic & Governance → Orange');
  console.log('  └─ Practical & Resource → Yellow');
  console.log('\n📧 Demo accounts (password: password123):');
  console.log('  ├─ admin@example.com');
  console.log('  ├─ alice@example.com');
  console.log('  ├─ bob@example.com');
  console.log('  └─ carol@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
