// Exact protected destinations only; never navigate an arbitrary login return URL.
export function authenticatedReturnPath(from: unknown): string {
  return typeof from === 'string' && /^\/(?:today|inventory|menu|imports|forecast|store)(?:[/?#]|$)/.test(from) ? from : '/imports'
}
