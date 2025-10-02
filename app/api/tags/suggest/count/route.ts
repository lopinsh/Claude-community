import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - Get user's pending suggestion count
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ count: 0 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { pendingSuggestionCount: true },
    });

    return NextResponse.json({ count: user?.pendingSuggestionCount || 0 });
  } catch (error) {
    console.error('Failed to fetch pending count:', error);
    return NextResponse.json({ count: 0 });
  }
}
