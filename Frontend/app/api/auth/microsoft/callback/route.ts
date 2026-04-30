import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=no_code', request.url)
    );
  }

  try {
    // Exchange code for tokens with your backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004';
    const response = await fetch(`${backendUrl}/api/users/microsoft-callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Microsoft authentication failed');
    }

    // Get token and user from response
    const { token, user } = data;

    // Create redirect URL with token and user data
    const redirectUrl = new URL('/login/callback', request.url);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify(user));

    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Microsoft OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error instanceof Error ? error.message : 'Authentication failed')}`,
        request.url
      )
    );
  }
}
