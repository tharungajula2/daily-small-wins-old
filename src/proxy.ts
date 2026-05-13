import { NextResponse, type NextRequest } from 'next/server'
// import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  // DEV OVERRIDE: Temporarily bypassing auth guard for local UI development.
  // We will uncomment this for Vercel deployment.
  // return await updateSession(request)

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
