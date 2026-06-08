import { createRemoteJWKSet, jwtVerify } from 'jose'

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
)

export async function verifyFirebaseToken(idToken: string): Promise<{ phone_number: string }> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  })
  const phone = payload.phone_number
  if (typeof phone !== 'string' || !phone) {
    throw new Error('No phone_number claim in token')
  }
  return { phone_number: phone }
}
