import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./InteractiveMatrix.tsx', import.meta.url), 'utf8')

describe('InteractiveMatrix', () => {
  it('uses the top-left matrix corner as a guide link', () => {
    expect(source).toContain('href="/matrix-guide"')
    expect(source).toContain('矩阵说明')
    expect(source).not.toContain('横：生产关系')
    expect(source).not.toContain('纵：能力剥夺')
    expect(source).not.toContain('为什么是这个矩阵？')
    expect(source).toContain('className="matrix-corner-link"')
    expect(source).toContain('Worker Ability Matrix')
    expect(source).not.toContain('Worker Ability Map')
    expect(source).toContain('联系方式可在飞书表单中自愿留下')
    expect(source).not.toContain('不收集联系方式')
  })

  it('uses Feishu as the supplement QR destination', () => {
    expect(source).toContain('DEFAULT_EXTERNAL_FORM_URL')
    expect(source).toContain('const supplementFormUrl =')
    expect(source).toContain('className="matrix-qrbox-link"')
    expect(source).toContain('href={supplementFormUrl}')
    expect(source).toContain('扫码补充这张矩阵')
  })

  it('keeps the manifesto legend from the original flyer', () => {
    expect(source).toContain('legend-manifesto')
    expect(source).toContain('★ 我们的纲领')
    expect(source).toContain('这张矩阵是我们的纲领 / 方向地图')
    expect(source).toContain('见 H7')
    expect(source).toContain('它是教材，不是给工友用的软件产品')
  })
})
