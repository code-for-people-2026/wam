import { InteractiveMatrix } from '@/components/InteractiveMatrix'
import { MATRIX_CELLS, MATRIX_COLUMNS, MATRIX_ROWS } from '@/lib/matrix'

export default function HomePage() {
  return <InteractiveMatrix rows={MATRIX_ROWS} columns={MATRIX_COLUMNS} cells={MATRIX_CELLS} />
}
