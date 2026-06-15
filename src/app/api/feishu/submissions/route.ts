import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { parseFeishuSubmissionWebhook } from '@/lib/feishu-webhook'
import { getPayloadClient } from '@/lib/payload/client'

function secretsMatch(provided: string, expected: string): boolean {
  if (!provided) {
    return false
  }

  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)

  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

export async function POST(request: Request) {
  const expectedSecret = process.env.FEISHU_WEBHOOK_SECRET
  if (!expectedSecret) {
    return NextResponse.json({ error: 'Webhook secret is not configured.' }, { status: 500 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const parsed = parseFeishuSubmissionWebhook(body)
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.message }, { status: parsed.status })
  }

  const headerSecret = request.headers.get('x-wam-webhook-secret') || ''
  const bodySecret = parsed.value.secret || ''
  if (!secretsMatch(headerSecret, expectedSecret) && !secretsMatch(bodySecret, expectedSecret)) {
    return NextResponse.json({ error: 'Unauthorized webhook request.' }, { status: 401 })
  }

  const payload = await getPayloadClient()
  const submission = await payload.create({
    collection: 'matrix-submissions',
    overrideAccess: true,
    data: {
      cellId: parsed.value.cellId,
      content: parsed.value.content,
      status: 'pending',
      authorName: null,
      contact: null,
      reviewNote: parsed.value.abilityArea
        ? `来源：飞书自动化；能力区域：${parsed.value.abilityArea}`
        : '来源：飞书自动化',
      userAgent: request.headers.get('user-agent') || undefined,
    },
  })

  return NextResponse.json(
    {
      id: submission.id,
      status: 'pending',
    },
    { status: 201 }
  )
}
