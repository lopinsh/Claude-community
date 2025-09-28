// app/api/activities/[id]/apply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notifyNewApplication } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()

    // Get activity and creator info
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      include: { creator: true }
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    if (!activity.isActive) {
      return NextResponse.json({ error: 'Activity is not active' }, { status: 400 })
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_activityId: {
          userId: session.user.id,
          activityId: params.id
        }
      }
    })

    if (existingApplication) {
      return NextResponse.json({ error: 'Already applied to this activity' }, { status: 400 })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        activityId: params.id,
        message,
        status: 'pending'
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    })

    // Create notification for the activity creator
    await notifyNewApplication(
      activity.creatorId,
      application.user.name || application.user.email,
      activity.title,
      application.id,
      activity.id
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Application submitted successfully',
      application 
    })

  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}