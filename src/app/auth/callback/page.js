import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get("code")
  const next = request.cookies.get("redirectAfterLogin")?.value || "/"
  const safeNext = next.startsWith("/") ? next : "/"

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=code_exchange_failed`)
  }

  const destination = new URL(safeNext, origin)

  const response = NextResponse.redirect(destination)
  response.cookies.delete("redirectAfterLogin")

  return response
}