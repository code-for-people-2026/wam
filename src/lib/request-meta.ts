import { createHash } from 'node:crypto'

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()
  return forwardedFor || realIp || 'unknown'
}

export function hashIp(ip: string): string {
  const salt = process.env.SUBMISSION_IP_HASH_SALT || process.env.PAYLOAD_SECRET || 'wam-dev-salt'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}
