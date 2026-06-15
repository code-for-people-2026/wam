import { describe, expect, it } from 'vitest'
import { buildExternalFormUrl } from './external-form-url'

describe('buildExternalFormUrl', () => {
  it('prefills and hides matrix context on the Feishu form URL', () => {
    const url = buildExternalFormUrl({
      baseUrl: 'https://qcng630f2p1h.feishu.cn/share/base/form/shrcnWYQXZRpgUhfBhYDSMSjVUg',
      cellId: 'C1',
      topic: '劳动议价',
    })

    expect(url).toBe(
      'https://qcng630f2p1h.feishu.cn/share/base/form/shrcnWYQXZRpgUhfBhYDSMSjVUg?prefill_%E6%89%80%E5%B1%9E%E6%A0%BC%E5%AD%90=C1&prefill_%E8%83%BD%E5%8A%9B%E5%8C%BA%E5%9F%9F=%E5%8A%B3%E5%8A%A8%E8%AE%AE%E4%BB%B7&hide_%E6%89%80%E5%B1%9E%E6%A0%BC%E5%AD%90=1&hide_%E8%83%BD%E5%8A%9B%E5%8C%BA%E5%9F%9F=1'
    )
  })

  it('preserves existing query parameters on the external form URL', () => {
    const url = buildExternalFormUrl({
      baseUrl: 'https://qcng630f2p1h.feishu.cn/share/base/form/shrcnWYQXZRpgUhfBhYDSMSjVUg?source=wam',
      cellId: 'E1',
      topic: '劳动议价',
    })

    expect(url).toContain('source=wam')
    expect(url).toContain('prefill_%E6%89%80%E5%B1%9E%E6%A0%BC%E5%AD%90=E1')
    expect(url).toContain('hide_%E6%89%80%E5%B1%9E%E6%A0%BC%E5%AD%90=1')
  })
})
