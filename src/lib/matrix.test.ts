import { describe, expect, it } from 'vitest'
import { MATRIX_CELLS, getMatrixCell, MATRIX_COLUMNS, MATRIX_ROWS } from './matrix'

describe('matrix data', () => {
  it('contains the existing A1-H7 matrix cells with row and column labels', () => {
    expect(MATRIX_ROWS).toHaveLength(7)
    expect(MATRIX_COLUMNS).toHaveLength(8)
    expect(MATRIX_CELLS).toHaveLength(56)

    expect(getMatrixCell('A1')).toMatchObject({
      id: 'A1',
      rowId: 'labor-bargaining',
      columnId: 'primary-sector',
    })
    expect(getMatrixCell('H7')).toMatchObject({
      id: 'H7',
      rowId: 'education-skills',
      columnId: 'unsegmented',
    })
  })
})
