'use client'

import { MessageSquarePlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { MatrixCell, MatrixColumn, MatrixRow, MatrixTagTone } from '@/lib/matrix'
import type { PublicSubmissionsByCell } from '@/lib/public-submissions'
import { buildExternalFormUrl, DEFAULT_EXTERNAL_FORM_URL } from '@/lib/external-form-url'

type MatrixPayload = {
  submissions?: PublicSubmissionsByCell
}

type Props = {
  rows: MatrixRow[]
  columns: MatrixColumn[]
  cells: MatrixCell[]
  initialCellId: string
}

const tagClass: Record<MatrixTagTone, string> = {
  red: 'tag tag-red',
  blue: 'tag tag-blue',
  empty: 'tag tag-empty',
  black: 'tag tag-black',
  gold: 'tag tag-gold',
  star: 'tag tag-star',
}

async function fetchSubmissions(): Promise<PublicSubmissionsByCell> {
  try {
    const response = await fetch('/api/matrix', { method: 'GET', cache: 'no-store' })
    const payload = (await response.json()) as MatrixPayload
    return payload.submissions ?? {}
  } catch {
    return {}
  }
}

export function CellDetailView({ rows, columns, cells, initialCellId }: Props) {
  const router = useRouter()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [submissions, setSubmissions] = useState<PublicSubmissionsByCell>({})
  const [activeCellId, setActiveCellId] = useState(initialCellId)

  const initialCell = useMemo(
    () => cells.find((cell) => cell.id === initialCellId) ?? cells[0],
    [cells, initialCellId]
  )

  const activeCell = useMemo(
    () => cells.find((cell) => cell.id === activeCellId) ?? initialCell,
    [activeCellId, cells, initialCell]
  )

  const initialColumnIndex = useMemo(
    () => columns.findIndex((column) => column.id === initialCell?.columnId),
    [columns, initialCell]
  )

  const initialRowIndex = useMemo(
    () => rows.findIndex((row) => row.id === initialCell?.rowId),
    [rows, initialCell]
  )

  useEffect(() => {
    void fetchSubmissions().then(setSubmissions)
  }, [])

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const setInitialPosition = () => {
      scroller.scrollLeft = Math.max(initialColumnIndex, 0) * scroller.clientWidth
      scroller.scrollTop = Math.max(initialRowIndex, 0) * scroller.clientHeight
    }

    setInitialPosition()
    const frame = requestAnimationFrame(setInitialPosition)

    return () => cancelAnimationFrame(frame)
  }, [initialColumnIndex, initialRowIndex])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let frame = 0
    const handleScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const nextColumnIndex = Math.round(scroller.scrollLeft / Math.max(scroller.clientWidth, 1))
        const nextRowIndex = Math.round(scroller.scrollTop / Math.max(scroller.clientHeight, 1))
        const nextRow = rows[nextRowIndex]
        const nextColumn = columns[nextColumnIndex]
        const nextCell = cells.find(
          (cell) => cell.rowId === nextRow?.id && cell.columnId === nextColumn?.id
        )
        if (!nextCell || nextCell.id === activeCellId) return

        setActiveCellId(nextCell.id)
        router.replace(`/cell/${nextCell.id}`, { scroll: false })
      })
    }

    scroller.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      scroller.removeEventListener('scroll', handleScroll)
    }
  }, [activeCellId, cells, columns, rows, router])

  return (
    <main className="cell-page">
      <header className="cell-page-topbar">
        <Link href="/" className="back-link">
          矩阵
        </Link>
        <div>
          <div className="kicker">上下翻能力项，左右切人群</div>
          <h1>牛马能力剥夺图</h1>
        </div>
      </header>

      <div className="cell-position-strip" aria-label="当前位置">
        <span>
          {activeCell?.id} / {activeCell?.columnTitle} × {activeCell?.rowTitle}
        </span>
        <div className="cell-position-map" aria-hidden="true">
          {rows.map((row) =>
            columns.map((column) => {
              const cell = cells.find((item) => item.rowId === row.id && item.columnId === column.id)
              return (
                <i
                  key={`${row.id}-${column.id}`}
                  className={cell?.id === activeCell?.id ? 'active' : ''}
                />
              )
            })
          )}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="cell-detail-carousel"
        aria-label="格子详情滑动区"
      >
        {cells.map((cell) => {
          const approvedItems = submissions[cell.id] ?? []
          const row = rows.find((item) => item.id === cell.rowId)
          const column = columns.find((item) => item.id === cell.columnId)
          const externalFormUrl = buildExternalFormUrl({
            baseUrl: process.env.NEXT_PUBLIC_EXTERNAL_FORM_URL || DEFAULT_EXTERNAL_FORM_URL,
            cellId: cell.id,
            topic: cell.rowTitle,
          })

          return (
            <article key={cell.id} className="cell-detail-slide" aria-label={`${cell.id} 格子详情`}>
              <div className="cell-detail-card">
                <div className="panel-head">
                  <div>
                    <span className="selected-id">{cell.id}</span>
                    <h2>
                      {column?.title ?? cell.columnTitle} × {row?.title ?? cell.rowTitle}
                    </h2>
                    <p className="cell-detail-subtitle">
                      {column?.subtitle}
                      {column?.subtitle && row?.subtitle ? ' / ' : ''}
                      {row?.subtitle}
                    </p>
                  </div>
                </div>

                <div className="cell-detail-tags" aria-label="格子现有内容">
                  {cell.tags.map((tag) => (
                    <span key={`${cell.id}-tag-${tag.text}`} className={tagClass[tag.tone]}>
                      {tag.tone === 'star' ? '★ ' : ''}
                      {tag.text}
                    </span>
                  ))}
                </div>

                <section className="approved-list">
                  <h3>已上墙</h3>
                  {approvedItems.length > 0 ? (
                    approvedItems.map((item) => (
                      <article key={`${cell.id}-approved-${item.id}`} className="submission-item">
                        <p>{item.content}</p>
                        <span>{item.authorName ? item.authorName : '现场补充'}</span>
                      </article>
                    ))
                  ) : (
                    <p>这个格子还在等第一条现场补充。</p>
                  )}
                </section>

                <a href={externalFormUrl} className="detail-submit-link" rel="noreferrer">
                  补一条
                  <MessageSquarePlus size={16} />
                </a>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}
