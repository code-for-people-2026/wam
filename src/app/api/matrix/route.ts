import { NextResponse } from 'next/server'
import { MATRIX_CELLS, MATRIX_COLUMNS, MATRIX_ROWS } from '@/lib/matrix'
import { getPayloadClient } from '@/lib/payload/client'
import {
  groupApprovedSubmissions,
  type MatrixSubmissionRecord,
  type MatrixSubmissionStatus,
} from '@/lib/public-submissions'

export const dynamic = 'force-dynamic'

type PayloadSubmissionDoc = {
  id: number | string
  cellId?: string | null
  content?: string | null
  authorName?: string | null
  contact?: string | null
  status?: MatrixSubmissionStatus | null
  createdAt?: string | null
}

function mapDoc(doc: PayloadSubmissionDoc): MatrixSubmissionRecord | null {
  if (!doc.cellId || !doc.content || !doc.status) {
    return null
  }

  return {
    id: String(doc.id),
    cellId: doc.cellId,
    content: doc.content,
    authorName: doc.authorName || null,
    contact: doc.contact || null,
    status: doc.status,
    createdAt: doc.createdAt || new Date().toISOString(),
  }
}

export async function GET() {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'matrix-submissions',
      where: {
        status: {
          equals: 'approved',
        },
      },
      sort: '-createdAt',
      limit: 500,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    })

    const rows = result.docs
      .map((doc) => mapDoc(doc as PayloadSubmissionDoc))
      .filter((doc): doc is MatrixSubmissionRecord => Boolean(doc))

    return NextResponse.json({
      rows: MATRIX_ROWS,
      columns: MATRIX_COLUMNS,
      cells: MATRIX_CELLS,
      submissions: groupApprovedSubmissions(rows),
      meta: {
        approvedCount: rows.length,
      },
    })
  } catch (error) {
    console.warn('Failed to load approved submissions:', error)
    return NextResponse.json({
      rows: MATRIX_ROWS,
      columns: MATRIX_COLUMNS,
      cells: MATRIX_CELLS,
      submissions: {},
      meta: {
        approvedCount: 0,
        offline: true,
      },
    })
  }
}
