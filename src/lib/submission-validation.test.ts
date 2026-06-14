import { describe, expect, it } from 'vitest'
import { validateSubmissionInput } from './submission-validation'

describe('validateSubmissionInput', () => {
  it('normalizes a valid anonymous submission', () => {
    const result = validateSubmissionInput({
      cellId: ' a1 ',
      content: '  我觉得这里可以做一个工时核对工具。 ',
      authorName: ' 小李 ',
      contact: ' wechat-id ',
      website: '',
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual({
        cellId: 'A1',
        content: '我觉得这里可以做一个工时核对工具。',
        authorName: '小李',
        contact: 'wechat-id',
      })
    }
  })

  it('rejects invalid cells, empty content, oversized content, and honeypot spam', () => {
    expect(validateSubmissionInput({ cellId: 'Z9', content: '有想法', website: '' })).toMatchObject({
      ok: false,
      code: 'INVALID_CELL',
    })
    expect(validateSubmissionInput({ cellId: 'A1', content: ' ', website: '' })).toMatchObject({
      ok: false,
      code: 'INVALID_CONTENT',
    })
    expect(validateSubmissionInput({ cellId: 'A1', content: 'x'.repeat(501), website: '' })).toMatchObject({
      ok: false,
      code: 'CONTENT_TOO_LONG',
    })
    expect(validateSubmissionInput({ cellId: 'A1', content: '有想法', website: 'bot' })).toMatchObject({
      ok: false,
      code: 'SPAM_DETECTED',
    })
  })
})
