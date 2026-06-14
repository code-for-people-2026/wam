import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload/client'
import { getClientIp, hashIp } from '@/lib/request-meta'
import { validateSubmissionInput } from '@/lib/submission-validation'

export const dynamic = 'force-dynamic'

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      error: { code, message },
      message,
    },
    { status }
  )
}

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'INVALID_JSON', '请求格式不正确')
  }

  const result = validateSubmissionInput((body ?? {}) as Record<string, unknown>)
  if (!result.ok) {
    return errorResponse(422, result.code, result.message)
  }

  try {
    const payload = await getPayloadClient()
    const clientIp = getClientIp(request)

    const created = await payload.create({
      collection: 'matrix-submissions',
      data: {
        cellId: result.value.cellId,
        content: result.value.content,
        authorName: result.value.authorName,
        contact: result.value.contact,
        status: 'pending',
        ipHash: hashIp(clientIp),
        userAgent: request.headers.get('user-agent') || null,
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
