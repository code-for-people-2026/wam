'use client'

import { MessageSquarePlus, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { MatrixCell, MatrixColumn, MatrixRow, MatrixTagTone } from '@/lib/matrix'
import type { PublicSubmissionsByCell } from '@/lib/public-submissions'

type MatrixPayload = {
  submissions?: PublicSubmissionsByCell
  meta?: {
    approvedCount?: number
    offline?: boolean
  }
}

type Props = {
  rows: MatrixRow[]
  columns: MatrixColumn[]
  cells: MatrixCell[]
}

const tagClass: Record<MatrixTagTone, string> = {
  red: 'tag tag-red',
  blue: 'tag tag-blue',
  empty: 'tag tag-empty',
  black: 'tag tag-black',
  gold: 'tag tag-gold',
  star: 'tag tag-star',
}

async function fetchMatrixPayload(): Promise<MatrixPayload> {
  const response = await fetch('/api/matrix', { method: 'GET', cache: 'no-store' })
  return (await response.json()) as MatrixPayload
}

export function InteractiveMatrix({ rows, columns, cells }: Props) {
  const [submissions, setSubmissions] = useState<PublicSubmissionsByCell>({})
  const [approvedCount, setApprovedCount] = useState(0)
  const [dataOffline, setDataOffline] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadSubmissions = async () => {
    setLoading(true)

    try {
      const payload = await fetchMatrixPayload()
      setSubmissions(payload.submissions ?? {})
      setApprovedCount(payload.meta?.approvedCount ?? 0)
      setDataOffline(Boolean(payload.meta?.offline))
    } catch {
      setSubmissions({})
      setApprovedCount(0)
      setDataOffline(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    void fetchMatrixPayload()
      .then((payload) => {
        if (!active) return
        setSubmissions(payload.submissions ?? {})
        setApprovedCount(payload.meta?.approvedCount ?? 0)
        setDataOffline(Boolean(payload.meta?.offline))
      })
      .catch(() => {
        if (!active) return
        setSubmissions({})
        setApprovedCount(0)
        setDataOffline(true)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="kicker">数据平权 · AI 下乡</div>
          <h1>牛马能力剥夺图</h1>
          <p className="matrix-subtitle">
            7 样能力 × 8 类处境，看看哪些人、哪些被剥夺的能力，还没人认真看过。
          </p>
        </div>
        <div className="topbar-side">
          <p className="matrix-axis-hint">
            横轴：人在生产关系里的位置
            <br />
            纵轴：被剥夺的能力
          </p>
          <div className="stats">
            <span>{loading ? '同步中' : `${approvedCount} 条已上墙`}</span>
            <button type="button" onClick={() => void loadSubmissions()} aria-label="刷新投稿">
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      {dataOffline ? (
        <div className="notice notice-hidden" role="status">
          互动数据暂时没有连上，矩阵仍可浏览。
        </div>
      ) : null}

      <section className="matrix-frame" aria-label="互动矩阵">
        <div className="matrix-scroll" tabIndex={0} aria-label="横向滚动浏览完整矩阵">
          <table className="matrix-table">
            <thead>
              <tr>
                <th aria-label="能力与处境" />
                {columns.map((column) => (
                  <th key={column.id} className={column.unsegmented ? 'unsegmented' : undefined}>
                    <b>{column.title}</b>
                    <small>{column.subtitle}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className="matrix-row-heading">
                    <b>{row.title}</b>
                    <small>{row.subtitle}</small>
                  </th>
                  {columns.map((column) => {
                    const cell = cells.find((item) => item.rowId === row.id && item.columnId === column.id)
                    if (!cell) return null
                    const approvedItems = submissions[cell.id] ?? []
                    const previewItems = approvedItems.slice(0, 2)
                    const count = approvedItems.length

                    return (
                      <td key={cell.id} className={column.unsegmented ? 'unsegmented' : undefined}>
                        <Link
                          className="matrix-cell-link"
                          href={`/cell/${cell.id}`}
                          aria-label={`${cell.id} ${column.title} × ${row.title}`}
                        >
                          <span className="cell-id">{cell.id}</span>
                          <span className="cell-tags">
                            {cell.tags.map((tag) => (
                              <span key={`${cell.id}-${tag.text}`} className={tagClass[tag.tone]}>
                                {tag.tone === 'star' ? '★ ' : ''}
                                {tag.text}
                              </span>
                            ))}
                          </span>
                          {approvedItems.length > 0 ? (
                            <span className="cell-approved" aria-label={`${cell.id} 已上墙投稿`}>
                              {previewItems.map((item) => (
                                <span key={`${cell.id}-approved-${item.id}`} className="cell-approved-item">
                                  {item.content}
                                </span>
                              ))}
                            </span>
                          ) : null}
                          <span className="cell-footer">
                            <MessageSquarePlus size={14} />
                            {count > 0 ? `${count} 条` : '补一条'}
                          </span>
                        </Link>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
