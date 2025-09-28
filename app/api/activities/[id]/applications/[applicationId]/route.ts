// app/api/activities/[id]/applications/[applicationId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notifyApplicationUpdate } from '@/lib/notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; applicationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()

    if (!['accepted', 'declined', 'removed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Verify user is the activity creator
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
      select: { creatorId: true, title: true }
    })

    if (!activity || activity.creatorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get the application with user info
    const application = await prisma.application.findUnique({
      where: { id: params.applicationId },
      include: { user: { select: { id: true } } }
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // For removal, we need to ensure the user was previously accepted
    if (status === 'removed' && application.status !== 'accepted') {
      return NextResponse.json({ error: 'Can only remove accepted members' }, { status: 400 })
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: params.applicationId },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Create notification for the user
    if (status === 'accepted') {
      await notifyApplicationUpdate(
        application.user.id,
        activity.title,
        'accepted',
        application.id,
        params.id
      )
    } else if (status === 'declined') {
      await notifyApplicationUpdate(
        application.user.id,
        activity.title,
        'declined',
        application.id,
        params.id
      )
    } else if (status === 'removed') {
      // For removal, we'll use 'declined' type but with a different message
      await notifyApplicationUpdate(
        application.user.id,
        activity.title,
        'declined',
        application.id,
        params.id
      )
    }

    // If user was removed, we should also revoke their access to messages
    // This is handled automatically by the message access check since status is no longer 'accepted'

    return NextResponse.json({ 
      success: true, 
      application: updatedApplication 
    })

  } catch (error) {
    console.error('Application status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    )
  }
}