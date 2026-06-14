import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload/client'
import { getClientIp, hashIp } from '@/lib/request-meta'
import { validateSubmissionInput } from '@/lib/submission-validation'

export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 4096
const MAX_USER_AGENT_LENGTH = 300
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 5
const submissionAttempts = new Map<string, number[]>()

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      error: { code, message },
      message,
    },
    { status }
  )
}

async function readJsonBody(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    throw new Error('BODY_TOO_LARGE')
  }

  const text = await request.text()
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    throw new Error('BODY_TOO_LARGE')
  }

  return JSON.parse(text)
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const recent = (submissionAttempts.get(key) ?? []).filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)

  if (recent.length >= RATE_LIMIT_MAX) {
    submissionAttempts.set(key, recent)
    return true
  }

  recent.push(now)
  submissionAttempts.set(key, recent)
  return false
}

function getTruncatedHeader(request: Request, name: string, maxLength: number): string | null {
  const value = request.headers.get(name)
  return value ? value.slice(0, maxLength) : null
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await readJsonBody(request)
  } catch (error) {
    if (error instanceof Error && error.message === 'BODY_TOO_LARGE') {
      return errorResponse(413, 'BODY_TOO_LARGE', '提交内容过大')
    }

    return errorResponse(400, 'INVALID_JSON', '请求格式不正确')
  }

  const result = validateSubmissionInput((body ?? {}) as Record<string, unknown>)
  if (!result.ok) {
    return errorResponse(422, result.code, result.message)
  }

  try {
    const payload = await getPayloadClient()
    const clientIp = getClientIp(request)
    const ipHash = hashIp(clientIp)

    if (isRateLimited(ipHash)) {
      return errorResponse(429, 'RATE_LIMITED', '提交太频繁，请稍后再试')
    }

    const created = await payload.create({
      collection: 'matrix-submissions',
      data: {
        cellId: result.value.cellId,
        content: result.value.content,
        authorName: result.value.authorName,
        contact: result.value.contact,
        status: 'pending',
        ipHash,
        userAgent: getTruncatedHeader(request, 'user-agent', MAX_USER_AGENT_LENGTH),
      },
      overrideAccess: true,
    })

    return NextResponse.json(
      {
        data: {
          id: String(created.id),
          cellId: result.value.cellId,
          status: 'pending',
        },
        message: '提交成功，审核通过后会显示在矩阵里',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create matrix submission:', error)
    return errorResponse(500, 'CREATE_FAILED', '提交失败，请稍后再试')
  }
}
