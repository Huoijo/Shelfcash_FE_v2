// Exact protected destinations only; never navigate an arbitrary login return URL.
export function authenticatedReturnPath(from: unknown): string {
  if (typeof from === 'string' && /^\/invitations\/[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(from)) return from
  return typeof from === 'string' && /^\/(?:today|inventory|menu|imports|forecast|store|notifications)(?:[/?#]|$)/.test(from) ? from : '/imports'
}
