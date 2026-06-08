import type { ConfirmationResult, Auth } from 'firebase/auth'

let _auth: Auth | null = null

export async function getFirebaseAuth(): Promise<Auth> {
  if (!_auth) {
    const { initializeApp, getApps } = await import('firebase/app')
    const { getAuth } = await import('firebase/auth')
    const config = {
      apiKey:     process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId:  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      appId:      process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    }
    const app = getApps().length ? getApps()[0] : initializeApp(config)
    _auth = getAuth(app)
  }
  return _auth
}

export async function verifyPhoneOTP(result: ConfirmationResult, token: string): Promise<string> {
  const cred = await result.confirm(token)
  return cred.user.getIdToken()
}
