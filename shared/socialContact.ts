/** True when `phone` has at least one digit (callable / WhatsApp). */
export function hasCallablePhone(phone: string | undefined): boolean {
  if (!phone) return false
  return /\d/.test(phone)
}

/**
 * If Places `websiteUri` is an Instagram profile (or reel path under a user), return a
 * normalized profile URL. Otherwise undefined.
 */
export function extractInstagramProfileUrl(website: string | undefined): string | undefined {
  if (!website?.trim()) return undefined
  try {
    const u = new URL(website.trim())
    const host = u.hostname.replace(/^www\./i, '').toLowerCase()
    if (host !== 'instagram.com' && host !== 'instagr.am') return undefined

    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length === 0) return undefined

    const first = parts[0].toLowerCase()
    const nonProfileRoots = new Set([
      'p',
      'reel',
      'reels',
      'tv',
      'stories',
      'explore',
      'accounts',
      'direct',
    ])
    if (nonProfileRoots.has(first)) return undefined

    const user = parts[0]
    return `https://www.instagram.com/${encodeURIComponent(user)}/`
  } catch {
    return undefined
  }
}

/** Short label like @handle from a normalized instagram URL */
export function instagramDisplayHandle(instagramUrl: string): string {
  try {
    const parts = new URL(instagramUrl).pathname.split('/').filter(Boolean)
    const user = parts[0]
    return user ? `@${user}` : 'Instagram'
  } catch {
    return 'Instagram'
  }
}
