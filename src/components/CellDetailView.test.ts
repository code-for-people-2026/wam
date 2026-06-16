import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const source = readFileSync(new URL('./CellDetailView.tsx', import.meta.url), 'utf8')

describe('CellDetailView mobile gestures', () => {
  it('keeps links and buttons out of swipe navigation without blocking the reading area', () => {
    expect(source).toContain('function shouldIgnoreSwipeTarget')
    expect(source).toContain("target.closest('a, button')")
    expect(source).not.toContain("target.closest('[data-swipe-ignore], a, button')")
    expect(source).not.toContain('className="approved-list" data-swipe-ignore')
    expect(source).toContain('onTouchStart={handleTouchStart}')
    expect(source).toContain('onTouchEnd={handleTouchEnd}')
    expect(source).not.toContain('onPointerDown=')
    expect(source).not.toContain('onPointerUp=')
  })

  it('lets approved submissions scroll vertically without changing cells', () => {
    expect(source).toContain('function isScrollableReadingTarget')
    expect(source).toContain("target.closest('.approved-list')")
    expect(source).toContain('startedInScrollableContent')
    expect(source).toContain("direction === 'up' || direction === 'down'")
  })

  it('throttles page-like swipe navigation so one gesture cannot chain through cells', () => {
    expect(source).toContain('SWIPE_NAVIGATION_COOLDOWN_MS')
    expect(source).toContain('let lastSwipeNavigationAt = 0')
    expect(source).toContain('lastSwipeNavigationAt = now')
    expect(source).not.toContain('lastNavigationAtRef')
  })
})
