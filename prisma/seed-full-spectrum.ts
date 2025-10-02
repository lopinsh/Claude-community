import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌈 Starting FULL SPECTRUM seed - showcasing all 6 categories!');

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
    console.log('✅ Database cleared!');
  }

  // ==================== USERS ====================
  console.log('👥 Creating diverse demo users...');
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

  const musicians = await prisma.user.createMany({
    data: [
      { email: 'alice@example.com', password: hashedPassword, name: 'Alice Johnson', bio: 'Choir director & pianist', location: 'Rīga' },
      { email: 'marta@example.com', password: hashedPassword, name: 'Marta Kalniņa', bio: 'Guitar teacher', location: 'Rīga' },
    ]
  });

  const athletes = await prisma.user.createMany({
    data: [
      { email: 'bob@example.com', password: hashedPassword, name: 'Bob Smith', bio: 'Basketball coach', location: 'Jūrmala' },
      { email: 'janis@example.com', password: hashedPassword, name: 'Jānis Bērziņš', bio: 'Marathon runner', location: 'Rīga' },
    ]
  });

  const educators = await prisma.user.createMany({
    data: [
      { email: 'carol@example.com', password: hashedPassword, name: 'Carol Williams', bio: 'Language teacher', location: 'Rīga' },
      { email: 'laura@example.com', password: hashedPassword, name: 'Laura Liepa', bio: 'Coding bootcamp instructor', location: 'Rīga' },
    ]
  });

  const organizers = await prisma.user.createMany({
    data: [
      { email: 'david@example.com', password: hashedPassword, name: 'David Chen', bio: 'Community organizer', location: 'Rīga' },
      { email: 'eva@example.com', password: hashedPassword, name: 'Eva Ozola', bio: 'Volunteer coordinator', location: 'Rīga' },
    ]
  });

  const makers = await prisma.user.createMany({
    data: [
      { email: 'frank@example.com', password: hashedPassword, name: 'Frank Miller', bio: 'Woodworker & repair cafe organizer', location: 'Rīga' },
      { email: 'gina@example.com', password: hashedPassword, name: 'Gina Rozīte', bio: 'Ceramics artist', location: 'Jūrmala' },
    ]
  });

  // Fetch users for group creation
  const [alice, marta, bob, janis, carol, laura, david, eva, frank, gina] = await Promise.all([
    prisma.user.findUnique({ where: { email: 'alice@example.com' } }),
    prisma.user.findUnique({ where: { email: 'marta@example.com' } }),
    prisma.user.findUnique({ where: { email: 'bob@example.com' } }),
    prisma.user.findUnique({ where: { email: 'janis@example.com' } }),
    prisma.user.findUnique({ where: { email: 'carol@example.com' } }),
    prisma.user.findUnique({ where: { email: 'laura@example.com' } }),
    prisma.user.findUnique({ where: { email: 'david@example.com' } }),
    prisma.user.findUnique({ where: { email: 'eva@example.com' } }),
    prisma.user.findUnique({ where: { email: 'frank@example.com' } }),
    prisma.user.findUnique({ where: { email: 'gina@example.com' } }),
  ]);

  console.log(`✅ Created 11 demo users`);

  // ==================== LEVEL 1 CATEGORIES ====================
  console.log('🎨 Creating Level 1 categories (6 main categories)...');

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

  // ==================== LEVEL 2: DOMAINS ====================
  console.log('📂 Creating Level 2 domains...');

  // SKILL & CRAFT (Teal)
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

  // MOVEMENT & WELLNESS (Green)
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

  // GATHERING & FUN (Peach)
  const socialGatherings = await prisma.tag.create({
    data: { name: 'Social Gatherings', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });
  const culturalEvents = await prisma.tag.create({
    data: { name: 'Cultural Events', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });
  const foodDrink = await prisma.tag.create({
    data: { name: 'Food & Drink', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });
  const gamesHobbies = await prisma.tag.create({
    data: { name: 'Games & Hobbies', parentId: gatheringFun.id, level: 2, status: 'ACTIVE' },
  });

  // PERFORMANCE & SPECTACLE (Blue)
  const musicPerformance = await prisma.tag.create({
    data: { name: 'Music Performance', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });
  const theaterDrama = await prisma.tag.create({
    data: { name: 'Theater & Drama', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });
  const dancePerformance = await prisma.tag.create({
    data: { name: 'Dance Performance', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });
  const visualArts = await prisma.tag.create({
    data: { name: 'Visual Arts Exhibition', parentId: performanceSpectacle.id, level: 2, status: 'ACTIVE' },
  });

  // CIVIC & GOVERNANCE (Orange)
  const communityOrganizing = await prisma.tag.create({
    data: { name: 'Community Organizing', parentId: civicGovernance.id, level: 2, status: 'ACTIVE' },
  });
  const volunteerCharity = await prisma.tag.create({
    data: { name: 'Volunteer & Charity', parentId: civicGovernance.id, level: 2, status: 'ACTIVE' },
  });
  const advocacy = await prisma.tag.create({
    data: { name: 'Advocacy & Activism', parentId: civicGovernance.id, level: 2, status: 'ACTIVE' },
  });

  // PRACTICAL & RESOURCE (Yellow)
  const skillsWorkshops = await prisma.tag.create({
    data: { name: 'Skills & Workshops', parentId: practicalResource.id, level: 2, status: 'ACTIVE' },
  });
  const exchangeSharing = await prisma.tag.create({
    data: { name: 'Exchange & Sharing', parentId: practicalResource.id, level: 2, status: 'ACTIVE' },
  });
  const repairMaintenance = await prisma.tag.create({
    data: { name: 'Repair & Maintenance', parentId: practicalResource.id, level: 2, status: 'ACTIVE' },
  });

  console.log(`✅ Created 23 Level 2 domains`);

  // ==================== LEVEL 3: SPECIFIC TAGS ====================
  console.log('🏷️  Creating Level 3 specific tags...');

  // Skill & Craft tags
  const guitar = await prisma.tag.create({ data: { name: 'Guitar', parentId: musicInstruments.id, level: 3, status: 'ACTIVE' } });
  const piano = await prisma.tag.create({ data: { name: 'Piano', parentId: musicInstruments.id, level: 3, status: 'ACTIVE' } });
  const painting = await prisma.tag.create({ data: { name: 'Painting', parentId: artsHandicrafts.id, level: 3, status: 'ACTIVE' } });
  const pottery = await prisma.tag.create({ data: { name: 'Pottery', parentId: artsHandicrafts.id, level: 3, status: 'ACTIVE' } });
  const knitting = await prisma.tag.create({ data: { name: 'Knitting', parentId: artsHandicrafts.id, level: 3, status: 'ACTIVE' } });
  const english = await prisma.tag.create({ data: { name: 'English', parentId: languagesLearning.id, level: 3, status: 'ACTIVE' } });
  const latvian = await prisma.tag.create({ data: { name: 'Latvian', parentId: languagesLearning.id, level: 3, status: 'ACTIVE' } });
  const programming = await prisma.tag.create({ data: { name: 'Programming', parentId: techDigital.id, level: 3, status: 'ACTIVE' } });
  const webDev = await prisma.tag.create({ data: { name: 'Web Development', parentId: techDigital.id, level: 3, status: 'ACTIVE' } });

  // Movement & Wellness tags
  const basketball = await prisma.tag.create({ data: { name: 'Basketball', parentId: teamSports.id, level: 3, status: 'ACTIVE' } });
  const soccer = await prisma.tag.create({ data: { name: 'Soccer', parentId: teamSports.id, level: 3, status: 'ACTIVE' } });
  const volleyball = await prisma.tag.create({ data: { name: 'Volleyball', parentId: teamSports.id, level: 3, status: 'ACTIVE' } });
  const running = await prisma.tag.create({ data: { name: 'Running', parentId: individualSports.id, level: 3, status: 'ACTIVE' } });
  const cycling = await prisma.tag.create({ data: { name: 'Cycling', parentId: individualSports.id, level: 3, status: 'ACTIVE' } });
  const yoga = await prisma.tag.create({ data: { name: 'Yoga', parentId: mindBody.id, level: 3, status: 'ACTIVE' } });
  const meditation = await prisma.tag.create({ data: { name: 'Meditation', parentId: mindBody.id, level: 3, status: 'ACTIVE' } });
  const hiking = await prisma.tag.create({ data: { name: 'Hiking', parentId: outdoorAdventure.id, level: 3, status: 'ACTIVE' } });

  // Gathering & Fun tags
  const bookClub = await prisma.tag.create({ data: { name: 'Book Club', parentId: socialGatherings.id, level: 3, status: 'ACTIVE' } });
  const meetups = await prisma.tag.create({ data: { name: 'Meetups', parentId: socialGatherings.id, level: 3, status: 'ACTIVE' } });
  const filmScreening = await prisma.tag.create({ data: { name: 'Film Screening', parentId: culturalEvents.id, level: 3, status: 'ACTIVE' } });
  const cooking = await prisma.tag.create({ data: { name: 'Cooking', parentId: foodDrink.id, level: 3, status: 'ACTIVE' } });
  const boardGames = await prisma.tag.create({ data: { name: 'Board Games', parentId: gamesHobbies.id, level: 3, status: 'ACTIVE' } });
  const chess = await prisma.tag.create({ data: { name: 'Chess', parentId: gamesHobbies.id, level: 3, status: 'ACTIVE' } });

  // Performance & Spectacle tags
  const choir = await prisma.tag.create({ data: { name: 'Choir', parentId: musicPerformance.id, level: 3, status: 'ACTIVE' } });
  const orchestra = await prisma.tag.create({ data: { name: 'Orchestra', parentId: musicPerformance.id, level: 3, status: 'ACTIVE' } });
  const improv = await prisma.tag.create({ data: { name: 'Improv', parentId: theaterDrama.id, level: 3, status: 'ACTIVE' } });
  const folkDance = await prisma.tag.create({ data: { name: 'Folk Dance', parentId: dancePerformance.id, level: 3, status: 'ACTIVE' } });
  const contemporary = await prisma.tag.create({ data: { name: 'Contemporary Dance', parentId: dancePerformance.id, level: 3, status: 'ACTIVE' } });
  const photography = await prisma.tag.create({ data: { name: 'Photography', parentId: visualArts.id, level: 3, status: 'ACTIVE' } });

  // Civic & Governance tags
  const neighborhood = await prisma.tag.create({ data: { name: 'Neighborhood Initiative', parentId: communityOrganizing.id, level: 3, status: 'ACTIVE' } });
  const environmental = await prisma.tag.create({ data: { name: 'Environmental Cleanup', parentId: volunteerCharity.id, level: 3, status: 'ACTIVE' } });
  const foodBank = await prisma.tag.create({ data: { name: 'Food Bank', parentId: volunteerCharity.id, level: 3, status: 'ACTIVE' } });
  const climate = await prisma.tag.create({ data: { name: 'Climate Action', parentId: advocacy.id, level: 3, status: 'ACTIVE' } });

  // Practical & Resource tags
  const woodworking = await prisma.tag.create({ data: { name: 'Woodworking', parentId: skillsWorkshops.id, level: 3, status: 'ACTIVE' } });
  const toolLibrary = await prisma.tag.create({ data: { name: 'Tool Library', parentId: exchangeSharing.id, level: 3, status: 'ACTIVE' } });
  const repairCafe = await prisma.tag.create({ data: { name: 'Repair Café', parentId: repairMaintenance.id, level: 3, status: 'ACTIVE' } });

  console.log(`✅ Created 37 Level 3 specific tags`);

  // ==================== GROUPS - ONE FOR EACH CATEGORY ====================
  console.log('🎪 Creating showcase groups (one per Level 1 category)...');

  // 1. SKILL & CRAFT (Teal) - Guitar Lessons
  const guitarGroup = await prisma.group.create({
    data: {
      title: 'Beginner Guitar Circle',
      description: 'Learn guitar basics in a supportive group environment. We meet weekly to practice chords, strumming patterns, and simple songs. Bring your own acoustic guitar!',
      location: 'Rīga, Kultūras centrs, Barona iela 31',
      maxMembers: 12,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: marta!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 2. SKILL & CRAFT (Teal) - Coding Workshop
  const codingGroup = await prisma.group.create({
    data: {
      title: 'Web Dev Bootcamp',
      description: 'Hands-on web development workshops for beginners. Learn HTML, CSS, and JavaScript through practical projects. Perfect for career changers!',
      location: 'Rīga, TechHub, Elizabetes iela 51',
      maxMembers: 20,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: laura!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 3. MOVEMENT & WELLNESS (Green) - Basketball
  const basketballGroup = await prisma.group.create({
    data: {
      title: 'Saturday Morning Basketball',
      description: 'Pickup basketball games every Saturday. All skill levels welcome! Great cardio workout and friendly competition.',
      location: 'Rīga, Sporta halle, Skolas iela 15',
      maxMembers: 20,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: bob!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 4. MOVEMENT & WELLNESS (Green) - Running Club
  const runningGroup = await prisma.group.create({
    data: {
      title: 'Rīga Marathon Training Group',
      description: 'Training for the Rīga Marathon? Join us for structured long runs and speed work. Coaches available for form check and training plans.',
      location: 'Rīga, Meeting point: Freedom Monument',
      maxMembers: 50,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: janis!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 5. GATHERING & FUN (Peach) - Book Club
  const bookClubGroup = await prisma.group.create({
    data: {
      title: 'Rīga International Book Club',
      description: 'Monthly discussions of contemporary fiction and classics. We read books in English and occasionally translated works. Coffee and snacks provided!',
      location: 'Rīga, National Library, Mūkusalas iela 3',
      maxMembers: 25,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: carol!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 6. GATHERING & FUN (Peach) - Board Games
  const boardGamesGroup = await prisma.group.create({
    data: {
      title: 'Friday Night Board Games',
      description: 'Weekly board game nights! We play everything from Catan to Wingspan. Beginners welcome - we teach all games. Bring your own snacks!',
      location: 'Rīga, Spēļu kafejnīca, Tērbatas iela 41',
      maxMembers: 30,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: admin.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 7. PERFORMANCE & SPECTACLE (Blue) - Choir
  const choirGroup = await prisma.group.create({
    data: {
      title: 'Rīga Community Choir',
      description: 'A joyful choir singing Latvian folk songs, classical pieces, and contemporary arrangements. No audition required - just bring your voice and enthusiasm!',
      location: 'Rīga, Kultūras pils, Brīvības iela 32',
      maxMembers: 60,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: alice!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 8. PERFORMANCE & SPECTACLE (Blue) - Folk Dance
  const folkDanceGroup = await prisma.group.create({
    data: {
      title: 'Latvian Folk Dance Ensemble',
      description: 'Traditional Latvian folk dances performed in authentic costumes. We perform at festivals and cultural events. Dance experience helpful but not required.',
      location: 'Rīga, Tautas nama, Saharova iela 16',
      maxMembers: 40,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: marta!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 9. CIVIC & GOVERNANCE (Orange) - Community Garden
  const neighborhoodGroup = await prisma.group.create({
    data: {
      title: 'Centrs Neighborhood Initiative',
      description: 'Working together to improve our neighborhood through community gardens, street clean-ups, and local advocacy. Make a difference where you live!',
      location: 'Rīga, Centrs district',
      maxMembers: 100,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: david!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 10. CIVIC & GOVERNANCE (Orange) - Environmental Volunteers
  const environmentalGroup = await prisma.group.create({
    data: {
      title: 'Daugava River Cleanup Volunteers',
      description: 'Monthly river cleanup events along the Daugava. We remove trash, document pollution, and advocate for cleaner waterways. Equipment provided!',
      location: 'Rīga, Various locations along Daugava',
      maxMembers: 75,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: eva!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 11. PRACTICAL & RESOURCE (Yellow) - Repair Café
  const repairCafeGroup = await prisma.group.create({
    data: {
      title: 'Rīga Repair Café',
      description: 'Bring broken items (electronics, clothing, furniture) and learn to repair them with guidance from skilled volunteers. Fight waste, learn skills, save money!',
      location: 'Rīga, MakerSpace, Sporta iela 2',
      maxMembers: 30,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: frank!.id,
      moderationStatus: 'APPROVED',
    },
  });

  // 12. PRACTICAL & RESOURCE (Yellow) - Tool Library
  const toolLibraryGroup = await prisma.group.create({
    data: {
      title: 'Community Tool Library & Workshops',
      description: 'Borrow tools for your DIY projects and attend woodworking workshops. From hammers to power drills - share resources, build community!',
      location: 'Rīga, Workshops, Maskavas iela 257',
      maxMembers: 50,
      isActive: true,
      groupType: 'RECURRING_GROUP',
      creatorId: gina!.id,
      moderationStatus: 'APPROVED',
    },
  });

  console.log(`✅ Created 12 diverse groups`);

  // ==================== TAG GROUPS ====================
  console.log('🔗 Linking groups to tags...');

  await prisma.groupTag.createMany({
    data: [
      // Guitar Group - Skill & Craft > Music & Instruments > Guitar
      { groupId: guitarGroup.id, tagId: skillCraft.id },
      { groupId: guitarGroup.id, tagId: musicInstruments.id },
      { groupId: guitarGroup.id, tagId: guitar.id },

      // Coding Group - Skill & Craft > Tech & Digital > Programming, Web Dev
      { groupId: codingGroup.id, tagId: skillCraft.id },
      { groupId: codingGroup.id, tagId: techDigital.id },
      { groupId: codingGroup.id, tagId: programming.id },
      { groupId: codingGroup.id, tagId: webDev.id },

      // Basketball - Movement & Wellness > Team Sports > Basketball
      { groupId: basketballGroup.id, tagId: movementWellness.id },
      { groupId: basketballGroup.id, tagId: teamSports.id },
      { groupId: basketballGroup.id, tagId: basketball.id },

      // Running - Movement & Wellness > Individual Sports > Running
      { groupId: runningGroup.id, tagId: movementWellness.id },
      { groupId: runningGroup.id, tagId: individualSports.id },
      { groupId: runningGroup.id, tagId: running.id },

      // Book Club - Gathering & Fun > Social Gatherings > Book Club
      { groupId: bookClubGroup.id, tagId: gatheringFun.id },
      { groupId: bookClubGroup.id, tagId: socialGatherings.id },
      { groupId: bookClubGroup.id, tagId: bookClub.id },

      // Board Games - Gathering & Fun > Games & Hobbies > Board Games
      { groupId: boardGamesGroup.id, tagId: gatheringFun.id },
      { groupId: boardGamesGroup.id, tagId: gamesHobbies.id },
      { groupId: boardGamesGroup.id, tagId: boardGames.id },

      // Choir - Performance & Spectacle > Music Performance > Choir
      { groupId: choirGroup.id, tagId: performanceSpectacle.id },
      { groupId: choirGroup.id, tagId: musicPerformance.id },
      { groupId: choirGroup.id, tagId: choir.id },

      // Folk Dance - Performance & Spectacle > Dance Performance > Folk Dance
      { groupId: folkDanceGroup.id, tagId: performanceSpectacle.id },
      { groupId: folkDanceGroup.id, tagId: dancePerformance.id },
      { groupId: folkDanceGroup.id, tagId: folkDance.id },

      // Neighborhood - Civic & Governance > Community Organizing > Neighborhood Initiative
      { groupId: neighborhoodGroup.id, tagId: civicGovernance.id },
      { groupId: neighborhoodGroup.id, tagId: communityOrganizing.id },
      { groupId: neighborhoodGroup.id, tagId: neighborhood.id },

      // Environmental - Civic & Governance > Volunteer & Charity > Environmental Cleanup
      { groupId: environmentalGroup.id, tagId: civicGovernance.id },
      { groupId: environmentalGroup.id, tagId: volunteerCharity.id },
      { groupId: environmentalGroup.id, tagId: environmental.id },

      // Repair Café - Practical & Resource > Repair & Maintenance > Repair Café
      { groupId: repairCafeGroup.id, tagId: practicalResource.id },
      { groupId: repairCafeGroup.id, tagId: repairMaintenance.id },
      { groupId: repairCafeGroup.id, tagId: repairCafe.id },

      // Tool Library - Practical & Resource > Exchange & Sharing > Tool Library
      { groupId: toolLibraryGroup.id, tagId: practicalResource.id },
      { groupId: toolLibraryGroup.id, tagId: exchangeSharing.id },
      { groupId: toolLibraryGroup.id, tagId: toolLibrary.id },
    ],
  });

  console.log(`✅ Linked groups to tags`);

  // ==================== EVENTS ====================
  console.log('📅 Creating events...');

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  await prisma.event.createMany({
    data: [
      // Skill & Craft events (Teal)
      {
        title: 'Guitar Practice Session',
        startDateTime: new Date(new Date(nextWeek).setHours(18, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(20, 0, 0, 0)),
        groupId: guitarGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: 'JavaScript Fundamentals Workshop',
        startDateTime: new Date(new Date(nextWeek).setHours(19, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(21, 30, 0, 0)),
        groupId: codingGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      // Movement & Wellness events (Green)
      {
        title: 'Saturday Morning Basketball',
        startDateTime: new Date(new Date(nextWeek).setHours(9, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(11, 0, 0, 0)),
        groupId: basketballGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: '15K Long Run',
        description: 'Easy pace group run through Old Town',
        startDateTime: new Date(new Date(nextWeek).setHours(8, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(10, 0, 0, 0)),
        groupId: runningGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      // Gathering & Fun events (Peach)
      {
        title: 'Book Discussion: Dune',
        startDateTime: new Date(new Date(twoWeeks).setHours(19, 0, 0, 0)),
        endDateTime: new Date(new Date(twoWeeks).setHours(21, 0, 0, 0)),
        groupId: bookClubGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: 'Friday Game Night',
        startDateTime: new Date(new Date(nextWeek).setHours(19, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(23, 0, 0, 0)),
        groupId: boardGamesGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      // Performance & Spectacle events (Blue)
      {
        title: 'Choir Rehearsal',
        startDateTime: new Date(new Date(nextWeek).setHours(18, 30, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(20, 30, 0, 0)),
        groupId: choirGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: 'Folk Dance Practice',
        startDateTime: new Date(new Date(nextWeek).setHours(19, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(21, 0, 0, 0)),
        groupId: folkDanceGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      // Civic & Governance events (Orange)
      {
        title: 'Neighborhood Planning Meeting',
        startDateTime: new Date(new Date(nextWeek).setHours(18, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(20, 0, 0, 0)),
        groupId: neighborhoodGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: 'Monthly River Cleanup',
        description: 'Bring gloves and wear boots!',
        startDateTime: new Date(new Date(nextWeek).setHours(10, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(13, 0, 0, 0)),
        groupId: environmentalGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      // Practical & Resource events (Yellow)
      {
        title: 'Saturday Repair Café',
        startDateTime: new Date(new Date(nextWeek).setHours(10, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(14, 0, 0, 0)),
        groupId: repairCafeGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
      {
        title: 'Woodworking Basics Workshop',
        startDateTime: new Date(new Date(nextWeek).setHours(14, 0, 0, 0)),
        endDateTime: new Date(new Date(nextWeek).setHours(17, 0, 0, 0)),
        groupId: toolLibraryGroup.id,
        eventType: 'REGULAR',
        visibility: 'PUBLIC',
      },
    ],
  });

  console.log(`✅ Created 12 events`);

  // ==================== APPLICATIONS ====================
  console.log('📝 Creating applications...');

  await prisma.application.createMany({
    data: [
      // Cross-pollination of interests
      { userId: alice!.id, groupId: basketballGroup.id, status: 'ACCEPTED' },
      { userId: bob!.id, groupId: choirGroup.id, status: 'ACCEPTED' },
      { userId: carol!.id, groupId: guitarGroup.id, status: 'ACCEPTED' },
      { userId: david!.id, groupId: bookClubGroup.id, status: 'ACCEPTED' },
      { userId: eva!.id, groupId: runningGroup.id, status: 'ACCEPTED' },
      { userId: frank!.id, groupId: boardGamesGroup.id, status: 'ACCEPTED' },
      { userId: gina!.id, groupId: folkDanceGroup.id, status: 'ACCEPTED' },
      { userId: admin.id, groupId: environmentalGroup.id, status: 'PENDING' },
      { userId: laura!.id, groupId: repairCafeGroup.id, status: 'ACCEPTED' },
      { userId: janis!.id, groupId: neighborhoodGroup.id, status: 'ACCEPTED' },
    ],
  });

  console.log(`✅ Created 10 applications`);

  console.log('\n🌈 ========================================');
  console.log('✅ FULL SPECTRUM SEED COMPLETED!');
  console.log('========================================\n');

  console.log('📊 SUMMARY:');
  console.log('  ├─ 11 users (diverse backgrounds)');
  console.log('  ├─ 6 Level 1 categories');
  console.log('  ├─ 23 Level 2 domains');
  console.log('  ├─ 37 Level 3 specific tags');
  console.log('  ├─ 12 groups (2 per Level 1 category)');
  console.log('  ├─ 12 events');
  console.log('  └─ 10 applications\n');

  console.log('🎨 CATEGORY SHOWCASE (expected card colors):');
  console.log('  ├─ 🟦 TEAL - Skill & Craft');
  console.log('  │   ├─ Beginner Guitar Circle');
  console.log('  │   └─ Web Dev Bootcamp');
  console.log('  ├─ 🟩 GREEN - Movement & Wellness');
  console.log('  │   ├─ Saturday Morning Basketball');
  console.log('  │   └─ Rīga Marathon Training Group');
  console.log('  ├─ 🟧 PEACH - Gathering & Fun');
  console.log('  │   ├─ Rīga International Book Club');
  console.log('  │   └─ Friday Night Board Games');
  console.log('  ├─ 🟦 BLUE - Performance & Spectacle');
  console.log('  │   ├─ Rīga Community Choir');
  console.log('  │   └─ Latvian Folk Dance Ensemble');
  console.log('  ├─ 🟧 ORANGE - Civic & Governance');
  console.log('  │   ├─ Centrs Neighborhood Initiative');
  console.log('  │   └─ Daugava River Cleanup Volunteers');
  console.log('  └─ 🟨 YELLOW - Practical & Resource');
  console.log('      ├─ Rīga Repair Café');
  console.log('      └─ Community Tool Library & Workshops\n');

  // ==================== CREATE ADMIN USER ====================
  console.log('👑 Creating admin user...');
  const adminPassword = await bcrypt.hash('123456', 10);

  const actualAdmin = await prisma.user.upsert({
    where: { email: 'ofeldmanis@gmail.com' },
    update: {
      password: adminPassword,
      name: 'Oskars',
      role: 'ADMIN',
    },
    create: {
      email: 'ofeldmanis@gmail.com',
      password: adminPassword,
      name: 'Oskars',
      role: 'ADMIN',
      location: 'Rīga',
    },
  });
  console.log('✅ Admin user created: ofeldmanis@gmail.com (password: 123456)');

  console.log('📧 Demo accounts (password: password123):');
  console.log('  admin@example.com, alice@example.com, bob@example.com,');
  console.log('  carol@example.com, marta@example.com, janis@example.com,');
  console.log('  laura@example.com, david@example.com, eva@example.com,');
  console.log('  frank@example.com, gina@example.com\n');

  console.log('👑 Admin account (password: 123456):');
  console.log('  ofeldmanis@gmail.com - ADMIN role\n');

  console.log('🎯 Browse the home page to see all 6 category colors in action!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
