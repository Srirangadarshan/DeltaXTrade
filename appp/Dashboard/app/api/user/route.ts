import { NextRequest, NextResponse } from 'next/server'
import { userDb } from '@/lib/db'

// GET /api/user?email=user@example.com
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const userProfile = await userDb.getUserProfile(email)
    
    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}

// POST /api/user
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    if (!userData.email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await userDb.saveUserProfile(userData)

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: result.userId })
  } catch (error) {
    console.error('Error saving user profile:', error)
    return NextResponse.json({ error: 'Failed to save user profile' }, { status: 500 })
  }
}