import type { MatrixCell, MatrixColumn, MatrixRow } from './matrix'

export type MatrixDirection = 'up' | 'right' | 'down' | 'left'

export function getAdjacentCellId(
  cellId: string,
  direction: MatrixDirection,
  rows: MatrixRow[],
  columns: MatrixColumn[],
  cells: MatrixCell[]
) {
  const cell = cells.find((item) => item.id === cellId)
  if (!cell) return null

  const rowIndex = rows.findIndex((row) => row.id === cell.rowId)
  const columnIndex = columns.findIndex((column) => column.id === cell.columnId)
  if (rowIndex < 0 || columnIndex < 0) return null

  const nextPosition = {
    up: [rowIndex - 1, columnIndex],
    right: [rowIndex, columnIndex + 1],
    down: [rowIndex + 1, columnIndex],
    left: [rowIndex, columnIndex - 1],
  } satisfies Record<MatrixDirection, [number, number]>

  const [nextRowIndex, nextColumnIndex] = nextPosition[direction]
  const nextRow = rows[nextRowIndex]
  const nextColumn = columns[nextColumnIndex]
  if (!nextRow || !nextColumn) return null

  return (
    cells.find((item) => item.rowId === nextRow.id && item.columnId === nextColumn.id)?.id ??
    null
  )
}
