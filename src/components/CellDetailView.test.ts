import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./CellDetailView.tsx', import.meta.url), 'utf8')

describe('CellDetailView mobile gestures', () => {
  it('keeps scrollable content and the Feishu CTA out of swipe navigation', () => {
    expect(source).toContain('function shouldIgnoreSwipeTarget')
    expect(source).toContain("target.closest('[data-swipe-ignore], a, button')")
    expect(source).toContain('className="approved-list" data-swipe-ignore')
    expect(source).toContain('data-swipe-ignore')
    expect(source).toContain('onTouchStart={handleTouchStart}')
    expect(source).toContain('onTouchEnd={handleTouchEnd}')
    expect(source).not.toContain('onPointerDown=')
    expect(source).not.toContain('onPointerUp=')
  })
})
