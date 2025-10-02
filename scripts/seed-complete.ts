import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding with improved schema...`)

  // 1. Clear existing data in dependency order
  await prisma.eventTag.deleteMany()
  await prisma.groupTag.deleteMany()
  await prisma.eventAttendee.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.groupMessage.deleteMany()
  await prisma.application.deleteMany()
  await prisma.event.deleteMany()
  await prisma.group.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data')

  // 2. Create hierarchical tag system
  const tagMap = new Map<string, string>()

  // Level 1 - Base Categories (VERTICAL hierarchy)
  const l1Tags = [
    { name: 'Physical Activities', key: 'PHYSICAL' },
    { name: 'Arts & Culture', key: 'ARTS' },
    { name: 'Learning & Skills', key: 'LEARNING' },
    { name: 'Social & Community', key: 'SOCIAL' },
    { name: 'Performance & Spectacle', key: 'PERFORMANCE' },
    { name: 'Movement & Wellness', key: 'MOVEMENT' },
  ]

  for (const tag of l1Tags) {
    const created = await prisma.tag.create({
      data: {
        name: tag.name,
        level: 1,
        group: 'VERTICAL',
        usageCount: 0,
      },
    })
    tagMap.set(tag.key, created.id)
    console.log(`Created L1 tag: ${tag.name}`)
  }

  // Level 2 - Activity Types (VERTICAL hierarchy)
  const l2Tags = [
    { name: 'Dance & Choreography', key: 'DANCE', parentKey: 'PHYSICAL' },
    { name: 'Team Sports', key: 'TEAM_SPORTS', parentKey: 'PHYSICAL' },
    { name: 'Individual Sports', key: 'INDIVIDUAL_SPORTS', parentKey: 'PHYSICAL' },
    { name: 'Fitness & Training', key: 'FITNESS', parentKey: 'PHYSICAL' },
    { name: 'Visual Arts', key: 'VISUAL_ARTS', parentKey: 'ARTS' },
    { name: 'Performing Arts', key: 'PERFORMING_ARTS', parentKey: 'ARTS' },
    { name: 'Music & Sound', key: 'MUSIC', parentKey: 'ARTS' },
    { name: 'Literature & Writing', key: 'LITERATURE', parentKey: 'ARTS' },
    { name: 'Languages', key: 'LANGUAGES', parentKey: 'LEARNING' },
    { name: 'Professional Skills', key: 'PROFESSIONAL', parentKey: 'LEARNING' },
    { name: 'Crafts & Hobbies', key: 'CRAFTS', parentKey: 'LEARNING' },
    { name: 'Technology', key: 'TECHNOLOGY', parentKey: 'LEARNING' },
    { name: 'Community Groups', key: 'COMMUNITY', parentKey: 'SOCIAL' },
    { name: 'Volunteering', key: 'VOLUNTEERING', parentKey: 'SOCIAL' },
    { name: 'Gaming', key: 'GAMING', parentKey: 'SOCIAL' },
  ]

  for (const tag of l2Tags) {
    const parentId = tagMap.get(tag.parentKey)
    const created = await prisma.tag.create({
      data: {
        name: tag.name,
        level: 2,
        group: 'VERTICAL',
        parentId,
        usageCount: 0,
      },
    })
    tagMap.set(tag.key, created.id)
    console.log(`Created L2 tag: ${tag.name} (parent: ${tag.parentKey})`)
  }

  // Level 3 - Specific Activities (VERTICAL hierarchy)
  const l3Tags = [
    { name: 'Latvian Folk Dance (Vidzeme Style)', key: 'FOLK_DANCE_VIDZEME', parentKey: 'DANCE' },
    { name: 'Baltic Folk Dance', key: 'FOLK_DANCE_BALTIC', parentKey: 'DANCE' },
    { name: 'Modern Dance', key: 'MODERN_DANCE', parentKey: 'DANCE' },
    { name: 'Ballet', key: 'BALLET', parentKey: 'DANCE' },
    { name: 'Football/Soccer', key: 'FOOTBALL', parentKey: 'TEAM_SPORTS' },
    { name: 'Basketball', key: 'BASKETBALL', parentKey: 'TEAM_SPORTS' },
    { name: 'Volleyball', key: 'VOLLEYBALL', parentKey: 'TEAM_SPORTS' },
    { name: 'Running', key: 'RUNNING', parentKey: 'INDIVIDUAL_SPORTS' },
    { name: 'Cycling', key: 'CYCLING', parentKey: 'INDIVIDUAL_SPORTS' },
    { name: 'Swimming', key: 'SWIMMING', parentKey: 'INDIVIDUAL_SPORTS' },
    { name: 'CrossFit', key: 'CROSSFIT', parentKey: 'FITNESS' },
    { name: 'Yoga', key: 'YOGA', parentKey: 'FITNESS' },
    { name: 'Pilates', key: 'PILATES', parentKey: 'FITNESS' },
    { name: 'Painting', key: 'PAINTING', parentKey: 'VISUAL_ARTS' },
    { name: 'Photography', key: 'PHOTOGRAPHY', parentKey: 'VISUAL_ARTS' },
    { name: 'Theater', key: 'THEATER', parentKey: 'PERFORMING_ARTS' },
    { name: 'Stand-up Comedy', key: 'STANDUP', parentKey: 'PERFORMING_ARTS' },
    { name: 'Guitar', key: 'GUITAR', parentKey: 'MUSIC' },
    { name: 'Piano', key: 'PIANO', parentKey: 'MUSIC' },
    { name: 'Choir Singing', key: 'CHOIR', parentKey: 'MUSIC' },
    { name: 'English Language', key: 'ENGLISH', parentKey: 'LANGUAGES' },
    { name: 'German Language', key: 'GERMAN', parentKey: 'LANGUAGES' },
    { name: 'Russian Language', key: 'RUSSIAN', parentKey: 'LANGUAGES' },
    { name: 'Web Development', key: 'WEB_DEV', parentKey: 'TECHNOLOGY' },
    { name: 'Data Science', key: 'DATA_SCIENCE', parentKey: 'TECHNOLOGY' },
    { name: 'Board Games', key: 'BOARD_GAMES', parentKey: 'GAMING' },
    { name: 'Video Games', key: 'VIDEO_GAMES', parentKey: 'GAMING' },
  ]

  for (const tag of l3Tags) {
    const parentId = tagMap.get(tag.parentKey)
    const created = await prisma.tag.create({
      data: {
        name: tag.name,
        level: 3,
        group: 'VERTICAL',
        parentId,
        usageCount: 0,
      },
    })
    tagMap.set(tag.key, created.id)
    console.log(`Created L3 tag: ${tag.name}`)
  }

  // Horizontal Tags - Attributes (no hierarchy)
  const horizontalTags = [
    { name: 'Beginner-Friendly', key: 'BEGINNER' },
    { name: 'Intermediate', key: 'INTERMEDIATE' },
    { name: 'Advanced', key: 'ADVANCED' },
    { name: 'Weekly', key: 'WEEKLY' },
    { name: 'Monthly', key: 'MONTHLY' },
    { name: 'One-time', key: 'ONETIME' },
    { name: 'Morning', key: 'MORNING' },
    { name: 'Afternoon', key: 'AFTERNOON' },
    { name: 'Evening', key: 'EVENING' },
    { name: 'Weekend', key: 'WEEKEND' },
    { name: 'Small Group (2-5)', key: 'SMALL_GROUP' },
    { name: 'Medium Group (6-15)', key: 'MEDIUM_GROUP' },
    { name: 'Large Group (15+)', key: 'LARGE_GROUP' },
    { name: 'Indoor', key: 'INDOOR' },
    { name: 'Outdoor', key: 'OUTDOOR' },
    { name: 'Free', key: 'FREE' },
    { name: 'Paid', key: 'PAID' },
    { name: 'Equipment Provided', key: 'EQUIPMENT_PROVIDED' },
    { name: 'Bring Own Equipment', key: 'BRING_EQUIPMENT' },
  ]

  for (const tag of horizontalTags) {
    const created = await prisma.tag.create({
      data: {
        name: tag.name,
        level: 1,
        group: 'HORIZONTAL',
        usageCount: 0,
      },
    })
    tagMap.set(tag.key, created.id)
    console.log(`Created horizontal tag: ${tag.name}`)
  }

  // 3. Create test users
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test Creator',
      location: 'Riga',
      bio: 'Folk dance enthusiast and group organizer',
    },
  })

  const testUser2 = await prisma.user.create({
    data: {
      email: 'member@example.com',
      name: 'Dance Enthusiast',
      location: 'Riga',
      bio: 'Looking to learn traditional Latvian dances',
    },
  })

  console.log('Created test users')

  // 4. Create sample groups
  const folkDanceGroup = await prisma.group.create({
    data: {
      title: 'Riga Vidzeme Folk Dancers',
      description: 'A community group dedicated to preserving and performing Vidzeme-style Latvian folk dances. We welcome dancers of all skill levels and meet weekly for rehearsals.',
      location: 'Riga Culture House, Basement Studio',
      maxMembers: 20,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser.id,
    },
  })

  const codingGroup = await prisma.group.create({
    data: {
      title: 'Riga Web Developers',
      description: 'A group for web developers to learn, share knowledge, and work on projects together. We focus on modern JavaScript frameworks and best practices.',
      location: 'TechHub Riga',
      maxMembers: 15,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser.id,
    },
  })

  const yogaGroup = await prisma.group.create({
    data: {
      title: 'Morning Yoga Sessions',
      description: 'Start your day with mindful movement and breathing. Suitable for all levels, from complete beginners to experienced practitioners.',
      location: 'Central Park, Riga',
      maxMembers: 12,
      groupType: 'RECURRING_GROUP',
      creatorId: testUser2.id,
    },
  })

  console.log('Created sample groups')

  // 5. Tag the groups
  const groupTagAssignments = [
    // Folk Dance Group Tags
    { groupId: folkDanceGroup.id, tagKey: 'PHYSICAL' },
    { groupId: folkDanceGroup.id, tagKey: 'PERFORMANCE' },
    { groupId: folkDanceGroup.id, tagKey: 'DANCE' },
    { groupId: folkDanceGroup.id, tagKey: 'FOLK_DANCE_VIDZEME' },
    { groupId: folkDanceGroup.id, tagKey: 'BEGINNER' },
    { groupId: folkDanceGroup.id, tagKey: 'WEEKLY' },
    { groupId: folkDanceGroup.id, tagKey: 'EVENING' },
    { groupId: folkDanceGroup.id, tagKey: 'INDOOR' },

    // Coding Group Tags
    { groupId: codingGroup.id, tagKey: 'LEARNING' },
    { groupId: codingGroup.id, tagKey: 'TECHNOLOGY' },
    { groupId: codingGroup.id, tagKey: 'WEB_DEV' },
    { groupId: codingGroup.id, tagKey: 'WEEKLY' },
    { groupId: codingGroup.id, tagKey: 'EVENING' },
    { groupId: codingGroup.id, tagKey: 'MEDIUM_GROUP' },

    // Yoga Group Tags
    { groupId: yogaGroup.id, tagKey: 'PHYSICAL' },
    { groupId: yogaGroup.id, tagKey: 'MOVEMENT' },
    { groupId: yogaGroup.id, tagKey: 'FITNESS' },
    { groupId: yogaGroup.id, tagKey: 'YOGA' },
    { groupId: yogaGroup.id, tagKey: 'BEGINNER' },
    { groupId: yogaGroup.id, tagKey: 'MORNING' },
    { groupId: yogaGroup.id, tagKey: 'OUTDOOR' },
    { groupId: yogaGroup.id, tagKey: 'SMALL_GROUP' },
  ]

  for (const assignment of groupTagAssignments) {
    const tagId = tagMap.get(assignment.tagKey)
    if (tagId) {
      await prisma.groupTag.create({
        data: {
          groupId: assignment.groupId,
          tagId: tagId,
        },
      })
    }
  }

  console.log('Tagged groups with relevant categories')

  // 6. Create sample events
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  // Weekly folk dance rehearsal
  const rehearsalEvent = await prisma.event.create({
    data: {
      title: 'Weekly Beginner Rehearsal',
      description: 'New members welcome! We will focus on basic steps and simple choreography.',
      startDateTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endDateTime: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      isAllDay: false,
      eventType: 'REGULAR',
      visibility: 'PRIVATE',
      maxMembers: 15,
      groupId: folkDanceGroup.id,
    },
  })

  // Special folk dance performance
  const performanceEvent = await prisma.event.create({
    data: {
      title: 'Midsummer Folk Dance Performance',
      description: 'Special public performance celebrating Jāņi with traditional Vidzeme dances. Come watch or join us!',
      startDateTime: nextMonth,
      endDateTime: new Date(nextMonth.getTime() + 3 * 60 * 60 * 1000), // 3 hours later
      isAllDay: false,
      eventType: 'SPECIAL',
      visibility: 'PUBLIC',
      location: 'Vermanes Garden, Riga',
      groupId: folkDanceGroup.id,
    },
  })

  // Coding workshop
  const codingWorkshop = await prisma.event.create({
    data: {
      title: 'React Hooks Deep Dive',
      description: 'Advanced workshop on React hooks patterns, custom hooks, and performance optimization.',
      startDateTime: nextWeek,
      endDateTime: new Date(nextWeek.getTime() + 4 * 60 * 60 * 1000), // 4 hours later
      isAllDay: false,
      eventType: 'SPECIAL',
      visibility: 'PUBLIC',
      requiresApproval: true,
      maxMembers: 12,
      groupId: codingGroup.id,
    },
  })

  // Morning yoga session
  const yogaSession = await prisma.event.create({
    data: {
      title: 'Sunrise Yoga Flow',
      description: 'Gentle morning yoga practice focusing on breath and mindful movement.',
      startDateTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000), // Tomorrow at 7 AM
      endDateTime: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 1 hour later
      isAllDay: false,
      eventType: 'REGULAR',
      visibility: 'PRIVATE',
      groupId: yogaGroup.id,
    },
  })

  console.log('Created sample events')

  // 7. Tag events with specific attributes
  const eventTagAssignments = [
    // Rehearsal event - beginner-friendly, regular
    { eventId: rehearsalEvent.id, tagKey: 'BEGINNER' },
    { eventId: rehearsalEvent.id, tagKey: 'WEEKLY' },
    { eventId: rehearsalEvent.id, tagKey: 'EVENING' },

    // Performance event - special, public
    { eventId: performanceEvent.id, tagKey: 'ADVANCED' },
    { eventId: performanceEvent.id, tagKey: 'OUTDOOR' },
    { eventId: performanceEvent.id, tagKey: 'LARGE_GROUP' },

    // Coding workshop - advanced, requires equipment
    { eventId: codingWorkshop.id, tagKey: 'ADVANCED' },
    { eventId: codingWorkshop.id, tagKey: 'BRING_EQUIPMENT' },
    { eventId: codingWorkshop.id, tagKey: 'AFTERNOON' },

    // Yoga session - beginner-friendly, morning
    { eventId: yogaSession.id, tagKey: 'BEGINNER' },
    { eventId: yogaSession.id, tagKey: 'MORNING' },
    { eventId: yogaSession.id, tagKey: 'OUTDOOR' },
  ]

  for (const assignment of eventTagAssignments) {
    const tagId = tagMap.get(assignment.tagKey)
    if (tagId) {
      await prisma.eventTag.create({
        data: {
          eventId: assignment.eventId,
          tagId: tagId,
        },
      })
    }
  }

  console.log('Tagged events with specific attributes')

  // 8. Create applications and memberships
  await prisma.application.create({
    data: {
      userId: testUser2.id,
      groupId: folkDanceGroup.id,
      status: 'accepted',
      message: 'I have always wanted to learn traditional Latvian dances!',
    },
  })

  await prisma.application.create({
    data: {
      userId: testUser2.id,
      groupId: codingGroup.id,
      status: 'pending',
      message: 'Interested in learning modern web development practices.',
    },
  })

  console.log('Created sample applications')

  // 9. Create event attendance
  await prisma.eventAttendee.create({
    data: {
      userId: testUser2.id,
      eventId: rehearsalEvent.id,
      status: 'GOING',
    },
  })

  await prisma.eventAttendee.create({
    data: {
      userId: testUser2.id,
      eventId: performanceEvent.id,
      status: 'MAYBE',
    },
  })

  console.log('Created sample event attendance')

  // 10. Create sample notifications
  await prisma.notification.create({
    data: {
      userId: testUser.id,
      type: 'NEW_APPLICATION',
      title: 'New Group Application',
      message: `${testUser2.name} applied to join your group "${folkDanceGroup.title}"`,
      groupId: folkDanceGroup.id,
    },
  })

  await prisma.notification.create({
    data: {
      userId: testUser2.id,
      type: 'APPLICATION_ACCEPTED',
      title: 'Application Accepted!',
      message: `Your application to join "${folkDanceGroup.title}" has been accepted!`,
      groupId: folkDanceGroup.id,
    },
  })

  console.log('Created sample notifications')

  // Update tag usage counts
  await prisma.tag.updateMany({
    where: {
      OR: [
        { groups: { some: {} } },
        { events: { some: {} } },
      ],
    },
    data: {
      usageCount: { increment: 1 },
    },
  })

  console.log('Updated tag usage counts')

  console.log(`Seeding completed successfully!`)
  console.log(`
  Summary:
  - Created ${l1Tags.length + l2Tags.length + l3Tags.length + horizontalTags.length} tags in hierarchical structure
  - Created 2 test users
  - Created 3 groups with different themes
  - Created 4 events with different types and visibility
  - Created applications, event attendance, and notifications
  - Added performance indexes to key models
  `)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })