import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./globals.css', import.meta.url), 'utf8')

function ruleBlock(selector: string) {
  const start = css.indexOf(`${selector} {`)
  expect(start).toBeGreaterThanOrEqual(0)

  const openBrace = css.indexOf('{', start)
  const closeBrace = css.indexOf('}', openBrace)
  expect(closeBrace).toBeGreaterThan(openBrace)

  return css.slice(openBrace + 1, closeBrace)
}

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
  it('styles the matrix guide entry and guide page shell', () => {
    const cornerLink = ruleBlock('.matrix-corner-link')

    expect(cornerLink).toContain('font-size: 17px;')
    expect(cornerLink).toContain('line-height: 1.3;')
    expect(cornerLink).not.toContain('min-height:')
    expect(cornerLink).not.toContain('align-items: center;')
    expect(css).not.toMatch(/\.matrix-corner-link span\s*\{/)
    expect(css).toMatch(/\.guide-back-icon\s*\{/)
    expect(css).toMatch(/\.guide-shell\s*\{/)
    expect(css).not.toMatch(/\.guide-primary-link\s*\{/)
  })

  it('keeps the home matrix as a compact thumbnail grid on mobile', () => {
    const mobile = mediaBlock('@media (max-width: 980px)')

    expect(mobile).toContain('.matrix-table {\n    min-width: 0;')
    expect(mobile).toContain('.matrix-table td {\n    height: 52px;')
    expect(mobile).toMatch(/\.matrix-cell-link\s*\{[\s\S]*min-height: 52px;/)
    expect(mobile).toMatch(/\.cell-tags,\s*\.cell-approved,\s*\.cell-footer\s*\{[\s\S]*display: none;/)
    expect(mobile).not.toContain('min-width: 1480px;')
  })

  it('keeps matrix coordinates visually subordinate to poster content', () => {
    const cellId = ruleBlock('.cell-id')

    expect(cellId).toContain('color: #8a847c;')
    expect(cellId).toContain('font-size: 12px;')
    expect(cellId).toContain('font-weight: 650;')
    expect(cellId).not.toContain('color: var(--accent);')
    expect(cellId).not.toContain('font-size: 15px;')
    expect(cellId).not.toContain('font-weight: 800;')
  })

  it('does not use free two-axis scroll snapping for mobile cell detail pages', () => {
    const mobile = mediaBlock('@media (max-width: 980px)')

    expect(mobile).not.toContain('scroll-snap-type: both mandatory;')
    expect(mobile).not.toContain('grid-template-columns: repeat(8, 100%);')
    expect(mobile).not.toContain('touch-action: none;')
    expect(mobile).toMatch(/\.cell-detail-carousel\s*\{[\s\S]*overflow: hidden;/)
    expect(mobile).toMatch(/\.approved-list\s*\{[\s\S]*flex: 1 1 auto;/)
    expect(mobile).toMatch(/\.approved-list\s*\{[\s\S]*overflow: auto;/)
    expect(mobile).toMatch(/\.approved-list\s*\{[\s\S]*touch-action: pan-y;/)
  })
})
