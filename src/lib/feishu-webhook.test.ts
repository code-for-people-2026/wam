import { describe, expect, it } from 'vitest'
import { parseFeishuSubmissionWebhook } from './feishu-webhook'

describe('parseFeishuSubmissionWebhook', () => {
  it('parses Chinese field names from a Feishu automation body', () => {
    const parsed = parseFeishuSubmissionWebhook({
      secret: 'shared-secret',
      '所属格子': ' C1 ',
      '能力区域': '劳动议价',
      '具体补充内容': '  外卖骑手希望有补贴规则截图工具  ',
    })

    expect(parsed).toEqual({
      ok: true,
      value: {
        cellId: 'C1',
        content: '外卖骑手希望有补贴规则截图工具',
        abilityArea: '劳动议价',
        secret: 'shared-secret',
      },
    })
  })

  it('parses nested fields from Feishu record-shaped payloads', () => {
    const parsed = parseFeishuSubmissionWebhook({
      fields: {
        '所属格子': [{ text: 'B2' }],
        '能力区域': '时间主权',
        '具体补充内容': [{ text: '排班工具要能解释调休逻辑' }],
      },
    })

    expect(parsed).toEqual({
      ok: true,
      value: {
        cellId: 'B2',
        content: '排班工具要能解释调休逻辑',
        abilityArea: '时间主权',
      },
    })
  })

  it('parses fields from Feishu record envelopes', () => {
    const parsed = parseFeishuSubmissionWebhook({
      event: {
        record: {
          fields: {
            '所属格子': [{ text: 'E1' }],
            '能力区域': '劳动议价',
            '具体补充内容': [{ text: '跨平台收入要能自动汇总' }],
          },
        },
      },
    })

    expect(parsed).toEqual({
      ok: true,
      value: {
        cellId: 'E1',
        content: '跨平台收入要能自动汇总',
        abilityArea: '劳动议价',
      },
    })
  })

  it('rejects invalid cell IDs and blank content', () => {
    expect(
      parseFeishuSubmissionWebhook({
        '所属格子': 'Z9',
        '具体补充内容': '有效内容',
      })
    ).toEqual({
      ok: false,
      status: 400,
      message: 'Invalid matrix cell.',
    })

    expect(
      parseFeishuSubmissionWebhook({
        '所属格子': 'A1',
        '具体补充内容': ' ',
      })
    ).toEqual({
      ok: false,
      status: 400,
      message: 'Missing submission content.',
    })
  })
})
