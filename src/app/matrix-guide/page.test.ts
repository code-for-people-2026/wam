import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const guidePath = new URL('./page.tsx', import.meta.url)

describe('matrix guide page', () => {
  it('explains why the matrix uses production-position groups and capability rows', () => {
    expect(existsSync(guidePath)).toBe(true)

    const source = readFileSync(guidePath, 'utf8')

    expect(source).toContain('Worker Ability Matrix')
    expect(source).toContain('为什么是这个矩阵？')
    expect(source).toContain('7 类工友 × 7 样能力')
    expect(source).toContain('生产关系里的位置')
    expect(source).toContain('能力进路')
    expect(source).toContain('被剥夺的能力')
    expect(source).toContain('https://fddi.fudan.edu.cn/45/c4/c18965a411076/page.htm')
    expect(source).toContain('张军读经典')
    expect(source).toContain('以自由看待发展')
    expect(source).toContain('rel="noreferrer"')
    expect(source).toContain('className="guide-back-icon"')
    expect(source).toContain('aria-label="返回矩阵"')
    expect(source).not.toContain('矩阵入口')
    expect(source).not.toContain('https://wam.codeforpeople.cn/')
    expect(source).not.toContain('Worker Ability Map')
    expect(source).not.toContain('这张图怎么用')
    expect(source).not.toContain('guide-primary-link')
  })
})
