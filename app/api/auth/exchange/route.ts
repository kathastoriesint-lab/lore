import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyFirebaseToken } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { idToken } = await req.json()
  if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })

  // Verify Firebase ID token — checks RS256 signature + expiry via Google's public JWKS
  let phone: string
  try {
    const decoded = await verifyFirebaseToken(idToken)
    phone = decoded.phone_number
  } catch {
    return NextResponse.json({ error: 'Invalid Firebase token' }, { status: 401 })
  }

  // Find existing Supabase user by phone
  const { data: existingId } = await adminClient.rpc('get_user_id_by_phone', { phone_number: phone })

  let userId: string
  if (existingId) {
    userId = existingId as string
  } else {
    const { data: newUser, error } = await adminClient.auth.admin.createUser({
      phone,
      phone_confirm: true,
    })
    if (error || !newUser?.user) {
      return NextResponse.json({ error: 'Failed to create user', detail: error?.message }, { status: 500 })
    }
    userId = newUser.user.id
  }

  // Get user's email to generate a magic link (needed for session exchange)
  const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId)
  if (userError || !userData?.user) {
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }

  // If user has no email, assign a stable placeholder so generateLink works
  let email = userData.user.email
  if (!email) {
    email = `${userId}@phone.lore.internal`
    await adminClient.auth.admin.updateUserById(userId, { email })
  }

  // Generate a magic link token — gives us a hashed_token the client can exchange
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })
  if (linkError || !linkData) {
    return NextResponse.json({ error: 'Failed to generate link', detail: linkError?.message }, { status: 500 })
  }

  // Return only the token — do not expose email (contains userId) to the client
  return NextResponse.json({ hashed_token: linkData.properties.hashed_token })
}
