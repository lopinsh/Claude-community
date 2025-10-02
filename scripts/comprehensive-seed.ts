import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function comprehensiveSeed() {
  console.log('🌱 Starting comprehensive database seed...')

  // Clear existing data in proper order
  console.log('🧹 Clearing existing data...')
  await prisma.groupTag.deleteMany()
  await prisma.eventTag.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.eventAttendee.deleteMany()
  await prisma.event.deleteMany()
  await prisma.application.deleteMany()
  await prisma.groupMessage.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.group.deleteMany()

  // Create Level 1 Categories (Motivations) with descriptions
  console.log('📂 Creating Level 1 Categories (Motivations)...')

  const skillCraft = await prisma.tag.create({
    data: {
      name: 'Skill & Craft',
      level: 1,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const movementWellness = await prisma.tag.create({
    data: {
      name: 'Movement & Wellness',
      level: 1,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const gatheringFun = await prisma.tag.create({
    data: {
      name: 'Gathering & Fun',
      level: 1,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const performanceSpectacle = await prisma.tag.create({
    data: {
      name: 'Performance & Spectacle',
      level: 1,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const civicGovernance = await prisma.tag.create({
    data: {
      name: 'Civic & Governance',
      level: 1,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const practicalResource = await prisma.tag.create({
    data: {
      name: 'Practical & Resource',
      level: 1,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Create Level 2 Categories (Domains)
  console.log('🏷️ Creating Level 2 Categories (Domains)...')

  // Skill & Craft domains
  const languagesLinguistics = await prisma.tag.create({
    data: {
      name: 'Languages & Linguistics',
      parentId: skillCraft.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const creativeArts = await prisma.tag.create({
    data: {
      name: 'Creative Arts',
      parentId: skillCraft.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const musicInstruments = await prisma.tag.create({
    data: {
      name: 'Music & Instruments',
      parentId: skillCraft.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const digitalTechSkills = await prisma.tag.create({
    data: {
      name: 'Digital & Tech Skills',
      parentId: skillCraft.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const foodCulinaryArts = await prisma.tag.create({
    data: {
      name: 'Food & Culinary Arts',
      parentId: skillCraft.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Movement & Wellness domains
  const teamSportsGames = await prisma.tag.create({
    data: {
      name: 'Team Sports & Games',
      parentId: movementWellness.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const individualFitness = await prisma.tag.create({
    data: {
      name: 'Individual Fitness',
      parentId: movementWellness.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const danceChoreography = await prisma.tag.create({
    data: {
      name: 'Dance & Choreography',
      parentId: movementWellness.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const outdoorAdventure = await prisma.tag.create({
    data: {
      name: 'Outdoor Adventure',
      parentId: movementWellness.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Gathering & Fun domains
  const generalSocialMeetups = await prisma.tag.create({
    data: {
      name: 'General Social Meetups',
      parentId: gatheringFun.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const volunteeringService = await prisma.tag.create({
    data: {
      name: 'Volunteering & Service',
      parentId: gatheringFun.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const boardGamesTTRPGs = await prisma.tag.create({
    data: {
      name: 'Board Games & TTRPGs',
      parentId: gatheringFun.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Performance & Spectacle domains
  const vocalChoralArts = await prisma.tag.create({
    data: {
      name: 'Vocal & Choral Arts',
      parentId: performanceSpectacle.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const theatreDrama = await prisma.tag.create({
    data: {
      name: 'Theatre & Drama',
      parentId: performanceSpectacle.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const audienceAppreciation = await prisma.tag.create({
    data: {
      name: 'Audience & Appreciation',
      parentId: performanceSpectacle.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Civic & Governance domains
  const localActionPolicy = await prisma.tag.create({
    data: {
      name: 'Local Action & Policy',
      parentId: civicGovernance.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const communityOrganizing = await prisma.tag.create({
    data: {
      name: 'Community Organizing',
      parentId: civicGovernance.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Practical & Resource domains
  const repairUpcycling = await prisma.tag.create({
    data: {
      name: 'Repair & Upcycling',
      parentId: practicalResource.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const skillBarterExchange = await prisma.tag.create({
    data: {
      name: 'Skill Barter & Exchange',
      parentId: practicalResource.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const resourceManagement = await prisma.tag.create({
    data: {
      name: 'Resource Management',
      parentId: practicalResource.id,
      level: 2,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Create Level 3 Categories (Specific Focus/Niche) - Selected examples
  console.log('🎯 Creating Level 3 Categories (Specific Focus)...')

  // Language specific focuses
  const languageExchange = await prisma.tag.create({
    data: {
      name: 'Language Exchange (Reciprocal)',
      parentId: languagesLinguistics.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const conversationPractice = await prisma.tag.create({
    data: {
      name: 'Conversation Practice (Casual)',
      parentId: languagesLinguistics.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Creative Arts specific focuses
  const potteryCeramics = await prisma.tag.create({
    data: {
      name: 'Pottery/Ceramics',
      parentId: creativeArts.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const lifeDrawing = await prisma.tag.create({
    data: {
      name: 'Life Drawing/Figure Sketching',
      parentId: creativeArts.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const creativeWriting = await prisma.tag.create({
    data: {
      name: 'Creative Writing Group',
      parentId: creativeArts.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Dance specific focuses
  const folkDanceLatvian = await prisma.tag.create({
    data: {
      name: 'Folk Dance (Latvian Regional)',
      parentId: danceChoreography.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const socialPartnerDance = await prisma.tag.create({
    data: {
      name: 'Social Partner Dance',
      parentId: danceChoreography.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Fitness specific focuses
  const yogaSpecific = await prisma.tag.create({
    data: {
      name: 'Yoga (Specific Style)',
      parentId: individualFitness.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const runningTraining = await prisma.tag.create({
    data: {
      name: 'Running/Marathon Training',
      parentId: individualFitness.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Choral specific focuses
  const classicalChoir = await prisma.tag.create({
    data: {
      name: 'Classical Repertoire Choir',
      parentId: vocalChoralArts.id,
      level: 3,
      group: 'VERTICAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Create Horizontal Tags (Attributes)
  console.log('🏁 Creating Horizontal Tags (Attributes)...')

  const beginnerFriendly = await prisma.tag.create({
    data: {
      name: 'Beginner-Friendly',
      level: 3,
      group: 'HORIZONTAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const weekly = await prisma.tag.create({
    data: {
      name: 'Weekly',
      level: 3,
      group: 'HORIZONTAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const evening = await prisma.tag.create({
    data: {
      name: 'Evening',
      level: 3,
      group: 'HORIZONTAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  const outdoor = await prisma.tag.create({
    data: {
      name: 'Outdoor',
      level: 3,
      group: 'HORIZONTAL',
      usageCount: 0,
      status: 'ACTIVE'
    }
  })

  // Create or find test user
  console.log('👤 Creating or finding test user...')
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      location: 'Rīga',
      bio: 'Community organizer and activity enthusiast'
    }
  })

  // Create sample groups with multi-category tagging
  console.log('🎭 Creating sample groups with multi-category tagging...')

  // 1. Pottery Workshop (Skill & Craft + Gathering & Fun)
  const potteryGroup = await prisma.group.create({
    data: {
      title: 'Community Pottery Workshop',
      description: 'Learn pottery while making friends! Weekly hands-on sessions for all skill levels. We focus on both technique development and social connection.',
      location: 'Rīga',
      maxMembers: 12,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser.id,
      tags: {
        create: [
          { tagId: skillCraft.id },
          { tagId: gatheringFun.id },
          { tagId: creativeArts.id },
          { tagId: potteryCeramics.id },
          { tagId: beginnerFriendly.id },
          { tagId: weekly.id }
        ]
      }
    }
  })

  // 2. Latvian Folk Dance Group (Movement & Wellness + Performance & Spectacle + Cultural Heritage)
  const folkDanceGroup = await prisma.group.create({
    data: {
      title: 'Rīga Folk Dance Ensemble',
      description: 'Traditional Latvian folk dancing group preparing for festivals and performances. Great exercise and cultural connection!',
      location: 'Rīga',
      maxMembers: 20,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser.id,
      tags: {
        create: [
          { tagId: movementWellness.id },
          { tagId: performanceSpectacle.id },
          { tagId: danceChoreography.id },
          { tagId: folkDanceLatvian.id },
          { tagId: weekly.id },
          { tagId: evening.id }
        ]
      }
    }
  })

  // 3. Language Exchange Café (Skill & Craft + Gathering & Fun)
  const languageGroup = await prisma.group.create({
    data: {
      title: 'Multilingual Coffee Meetup',
      description: 'Practice languages in a relaxed café setting. We rotate between Latvian, English, German, and Russian conversation tables.',
      location: 'Rīga',
      maxMembers: 30,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser.id,
      tags: {
        create: [
          { tagId: skillCraft.id },
          { tagId: gatheringFun.id },
          { tagId: languagesLinguistics.id },
          { tagId: languageExchange.id },
          { tagId: beginnerFriendly.id },
          { tagId: weekly.id }
        ]
      }
    }
  })

  // 4. Community Garden Project (Practical & Resource + Civic & Governance + Gathering & Fun)
  const gardenGroup = await prisma.group.create({
    data: {
      title: 'Neighborhood Community Garden',
      description: 'Collaborative gardening project focused on sustainable food production and community building. Monthly planning meetings and weekly garden work.',
      location: 'Rīga',
      maxMembers: 25,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser.id,
      tags: {
        create: [
          { tagId: practicalResource.id },
          { tagId: civicGovernance.id },
          { tagId: gatheringFun.id },
          { tagId: resourceManagement.id },
          { tagId: communityOrganizing.id },
          { tagId: outdoor.id }
        ]
      }
    }
  })

  // 5. Classical Music Choir (Performance & Spectacle + Skill & Craft)
  const choirGroup = await prisma.group.create({
    data: {
      title: 'Rīga Chamber Choir',
      description: 'Semi-professional choir performing classical and contemporary pieces. Auditions required, but we welcome committed singers of all levels.',
      location: 'Rīga',
      maxMembers: 40,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser.id,
      tags: {
        create: [
          { tagId: performanceSpectacle.id },
          { tagId: skillCraft.id },
          { tagId: vocalChoralArts.id },
          { tagId: musicInstruments.id },
          { tagId: classicalChoir.id },
          { tagId: weekly.id },
          { tagId: evening.id }
        ]
      }
    }
  })

  // 6. Morning Running Group (Movement & Wellness + Gathering & Fun)
  const runningGroup = await prisma.group.create({
    data: {
      title: 'Dawn Runners Rīga',
      description: 'Early morning running group exploring different routes around the city. All paces welcome - we have groups for different fitness levels.',
      location: 'Rīga',
      maxMembers: 15,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser.id,
      tags: {
        create: [
          { tagId: movementWellness.id },
          { tagId: gatheringFun.id },
          { tagId: individualFitness.id },
          { tagId: runningTraining.id },
          { tagId: outdoor.id },
          { tagId: beginnerFriendly.id }
        ]
      }
    }
  })

  // Create sample events for some groups
  console.log('📅 Creating sample events...')

  // Events for pottery group
  await prisma.event.create({
    data: {
      title: 'Beginner Pottery Session',
      description: 'Introduction to wheel throwing and hand building techniques',
      startDateTime: new Date('2025-01-15T18:00:00Z'),
      endDateTime: new Date('2025-01-15T20:00:00Z'),
      visibility: 'PUBLIC',
      groupId: potteryGroup.id,
      location: 'Art Studio, Krasta iela 50, Rīga'
    }
  })

  // Events for folk dance group
  await prisma.event.create({
    data: {
      title: 'Weekly Dance Practice',
      description: 'Regular rehearsal focusing on traditional Vidzeme region dances',
      startDateTime: new Date('2025-01-16T19:00:00Z'),
      endDateTime: new Date('2025-01-16T21:00:00Z'),
      visibility: 'PRIVATE',
      groupId: folkDanceGroup.id,
      eventType: 'REGULAR'
    }
  })

  await prisma.event.create({
    data: {
      title: 'Public Folk Dance Performance',
      description: 'Special performance at the Culture Night festival',
      startDateTime: new Date('2025-02-15T20:00:00Z'),
      endDateTime: new Date('2025-02-15T21:30:00Z'),
      visibility: 'PUBLIC',
      groupId: folkDanceGroup.id,
      eventType: 'SPECIAL',
      maxMembers: 100
    }
  })

  console.log('✅ Comprehensive seed completed successfully!')
  console.log('📊 Created:')
  console.log('  - 6 Level 1 categories (Motivations)')
  console.log('  - 15 Level 2 categories (Domains)')
  console.log('  - 12 Level 3 categories (Specific Focus)')
  console.log('  - 4 Horizontal attributes')
  console.log('  - 6 Sample groups with multi-category tagging')
  console.log('  - 3 Sample events')
  console.log('  - 1 Test user')
}

comprehensiveSeed()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })