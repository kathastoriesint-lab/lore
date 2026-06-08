/**
 * Shared voice config + cache-key format.
 * Imported by BOTH the server route (app/api/narrate) and the client
 * (components/NarrationButton) so the MP3 filename hash can never drift
 * between where it's written and where it's read.
 */
export const VOICE_ID = 'H6QPv2pQZDcGqLwDTIJQ'
export const MODEL_ID = 'eleven_multilingual_v2'
export const VOICE_SETTINGS = {
  stability: 0.2,
  similarity_boost: 0.75,
  style: 0.7,
  use_speaker_boost: true,
}

/** Exact string that gets hashed to name the cached MP3. Order matters. */
export const cacheKeyInput = (text: string) =>
  `${VOICE_ID}|${JSON.stringify(VOICE_SETTINGS)}|${text}`

/** Browser-side SHA-256 → first 16 hex chars (matches the server's node:crypto hash). */
export async function audioHashBrowser(text: string): Promise<string> {
  const data = new TextEncoder().encode(cacheKeyInput(text))
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}
