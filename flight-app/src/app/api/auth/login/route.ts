import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Here you would typically validate against your database
    // This is just an example
    const isAdmin = email === 'admin@example.com' && password === 'admin123'
    const isUser = email === 'user@example.com' && password === 'user123'

    if (!isAdmin && !isUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { 
        email, 
        role: isAdmin ? 'admin' : 'user' 
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600 // 1 hour
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}