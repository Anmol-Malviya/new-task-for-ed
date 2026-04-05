import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // Accept admin/admin as per requirements
  if ((email === 'admin' || email === 'admin@gmail.com') && password === 'admin') {
    return NextResponse.json({
      user: { id: 'admin-id', email: 'admin@gmail.com', name: 'Admin User' },
      token: 'admin-token'
    });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}
