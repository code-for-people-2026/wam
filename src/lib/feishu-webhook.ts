import { MATRIX_CELLS, type MatrixCellId } from './matrix'

const validCellIds = new Set(MATRIX_CELLS.map((cell) => cell.id))

type FeishuWebhookValue = {
  cellId: MatrixCellId
  content: string
  abilityArea?: string
  submissionType?: string
  authorName?: string
  contact?: string
  secret?: string
}

type FeishuWebhookParseResult =
  | {
      ok: true
      value: FeishuWebhookValue
    }
  | {
      ok: false
      status: 400
      message: string
    }

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function stringifyFieldValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyFieldValue(item)).join('')
  }

  const record = asRecord(value)
  if (!record) {
    return ''
  }

  for (const key of ['text', 'name', 'value']) {
    const nested = stringifyFieldValue(record[key])
    if (nested) {
      return nested
    }
  }

  return ''
}

function readField(body: Record<string, unknown>, names: string[]): string {
  const record = asRecord(body.record)
  const event = asRecord(body.event)
  const eventRecord = asRecord(event?.record)
  const fieldSources = [body, asRecord(body.fields), asRecord(record?.fields), asRecord(eventRecord?.fields)]

  for (const name of names) {
    for (const source of fieldSources) {
      const value = stringifyFieldValue(source?.[name]).trim()
      if (value) {
        return value
      }
    }
  }

  return ''
}

function isMatrixCellId(value: string): value is MatrixCellId {
  return validCellIds.has(value)
}

export function parseFeishuSubmissionWebhook(body: unknown): FeishuWebhookParseResult {
  const record = asRecord(body)
  if (!record) {
    return {
      ok: false,
      status: 400,
      message: 'Invalid JSON body.',
    }
  }

  const cellId = readField(record, ['所属格子', 'cellId', 'cell'])
  const content = readField(record, ['具体补充内容', 'content', 'submission'])
  const abilityArea = readField(record, ['能力区域', 'abilityArea', 'topic'])
  const submissionType = readField(record, ['补充类型', '内容类型', '投稿类型', 'submissionType', 'type', 'category'])
  const authorName = readField(record, ['署名', '个人信息', '昵称', '姓名', 'authorName', 'name'])
  const contact = readField(record, ['联系方式', '联系信息', 'contact', 'phone', 'wechat', 'email'])
  const secret = readField(record, ['secret', 'webhookSecret'])

  if (!isMatrixCellId(cellId)) {
    return {
      ok: false,
      status: 400,
      message: 'Invalid matrix cell.',
    }
  }

  if (!content) {
    return {
      ok: false,
      status: 400,
      message: 'Missing submission content.',
    }
  }

  return {
    ok: true,
    value: {
      cellId,
      content,
      ...(abilityArea ? { abilityArea } : {}),
      ...(submissionType ? { submissionType } : {}),
      ...(authorName ? { authorName } : {}),
      ...(contact ? { contact } : {}),
      ...(secret ? { secret } : {}),
    },
  }
}
