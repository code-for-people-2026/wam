import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./globals.css', import.meta.url), 'utf8')

function mediaBlock(query: string) {
  const start = css.indexOf(query)
  expect(start).toBeGreaterThanOrEqual(0)

  const openBrace = css.indexOf('{', start)
  let depth = 0

  for (let index = openBrace; index < css.length; index += 1) {
    if (css[index] === '{') depth += 1
    if (css[index] === '}') depth -= 1
    if (depth === 0) {
      return css.slice(openBrace + 1, index)
    }
  }

  throw new Error(`Unclosed media block: ${query}`)
}

describe('global responsive matrix styles', () => {
  it('keeps the home matrix as a compact thumbnail grid on mobile', () => {
    const mobile = mediaBlock('@media (max-width: 980px)')

    expect(mobile).toContain('.matrix-table {\n    min-width: 0;')
    expect(mobile).toContain('.matrix-table td {\n    height: 52px;')
    expect(mobile).toMatch(/\.matrix-cell-link\s*\{[\s\S]*min-height: 52px;/)
    expect(mobile).toMatch(/\.cell-tags,\s*\.cell-approved,\s*\.cell-footer\s*\{[\s\S]*display: none;/)
    expect(mobile).not.toContain('min-width: 1480px;')
  })
})
