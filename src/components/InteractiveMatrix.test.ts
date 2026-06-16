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
  })
})
