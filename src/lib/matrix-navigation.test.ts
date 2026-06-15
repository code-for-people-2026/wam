import { describe, expect, it } from 'vitest'
import { MATRIX_CELLS, MATRIX_COLUMNS, MATRIX_ROWS } from './matrix'
import { getAdjacentCellId } from './matrix-navigation'

describe('getAdjacentCellId', () => {
  it('moves across columns and rows from a matrix cell', () => {
    expect(getAdjacentCellId('A1', 'right', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBe('B1')
    expect(getAdjacentCellId('A1', 'down', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBe('A2')
    expect(getAdjacentCellId('E3', 'left', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBe('D3')
    expect(getAdjacentCellId('E3', 'up', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBe('E2')
  })

  it('returns null at matrix edges or for unknown cells', () => {
    expect(getAdjacentCellId('A1', 'left', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBeNull()
    expect(getAdjacentCellId('A1', 'up', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBeNull()
    expect(getAdjacentCellId('H7', 'right', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBeNull()
    expect(getAdjacentCellId('H7', 'down', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBeNull()
    expect(getAdjacentCellId('Z9', 'right', MATRIX_ROWS, MATRIX_COLUMNS, MATRIX_CELLS)).toBeNull()
  })
})
