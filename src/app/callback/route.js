import { NextResponse } from 'next/server'
import { createClient } from '@/lib/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/'

  // if no code is received, user is sent back to home page
  if (!code) return NextResponse.redirect(new URL("/", request.url));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
  // if returned auth session's data is blank or an error is thrown, user is sent back to home page
  if (error || !data?.user) {
    console.error("Auth error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(`${origin}${next}`);
}