import { isMatrixCellId, type MatrixCellId } from './matrix'

export type SubmissionInput = {
  cellId?: unknown
  content?: unknown
  authorName?: unknown
  contact?: unknown
  website?: unknown
}

export type ValidSubmission = {
  cellId: MatrixCellId
  content: string
  authorName: string | null
  contact: string | null
}

export type SubmissionValidationErrorCode =
  | 'SPAM_DETECTED'
  | 'INVALID_CELL'
  | 'INVALID_CONTENT'
  | 'CONTENT_TOO_LONG'
  | 'AUTHOR_TOO_LONG'
  | 'CONTACT_TOO_LONG'

export type SubmissionValidationResult =
  | { ok: true; value: ValidSubmission }
  | { ok: false; code: SubmissionValidationErrorCode; message: string }

const MAX_CONTENT_LENGTH = 500
const MAX_AUTHOR_LENGTH = 30
const MAX_CONTACT_LENGTH = 80

function normalizeText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function emptyToNull(value: string): string | null {
  return value.length > 0 ? value : null
}

export function validateSubmissionInput(input: SubmissionInput): SubmissionValidationResult {
  const website = normalizeText(input.website)
  if (website) {
    return { ok: false, code: 'SPAM_DETECTED', message: '提交失败，请刷新后重试' }
  }

  const cellId = normalizeText(input.cellId).toUpperCase()
  if (!isMatrixCellId(cellId)) {
    return { ok: false, code: 'INVALID_CELL', message: '请选择一个有效格子' }
  }

  const content = normalizeText(input.content)
  if (!content) {
    return { ok: false, code: 'INVALID_CONTENT', message: '请写下你的痛点、观察或点子' }
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    return { ok: false, code: 'CONTENT_TOO_LONG', message: `内容不能超过 ${MAX_CONTENT_LENGTH} 字` }
  }

  const authorName = normalizeText(input.authorName)
  if (authorName.length > MAX_AUTHOR_LENGTH) {
    return { ok: false, code: 'AUTHOR_TOO_LONG', message: `署名不能超过 ${MAX_AUTHOR_LENGTH} 字` }
  }

  const contact = normalizeText(input.contact)
  if (contact.length > MAX_CONTACT_LENGTH) {
    return { ok: false, code: 'CONTACT_TOO_LONG', message: `联系方式不能超过 ${MAX_CONTACT_LENGTH} 字` }
  }

  return {
    ok: true,
    value: {
      cellId,
      content,
      authorName: emptyToNull(authorName),
      contact: emptyToNull(contact),
    },
  }
}
