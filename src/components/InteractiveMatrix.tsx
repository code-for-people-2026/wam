'use client'

import { MessageSquarePlus, RefreshCcw, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { MatrixCell, MatrixColumn, MatrixRow, MatrixTagTone } from '@/lib/matrix'
import type { PublicSubmissionsByCell } from '@/lib/public-submissions'
import { buildExternalFormUrl, DEFAULT_EXTERNAL_FORM_URL } from '@/lib/external-form-url'

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
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(cells[0]?.id ?? 'A1')
  const [submissions, setSubmissions] = useState<PublicSubmissionsByCell>({})
  const [approvedCount, setApprovedCount] = useState(0)
  const [dataOffline, setDataOffline] = useState(false)
  const [loading, setLoading] = useState(true)
  const [panelOpen, setPanelOpen] = useState(true)

  const selectedCell = useMemo(
    () => cells.find((cell) => cell.id === selectedId) ?? cells[0],
    [cells, selectedId]
  )

  const chooseCell = (cellId: string) => {
    setSelectedId(cellId)
    setPanelOpen(true)
  }

  const openCell = (cellId: string) => {
    if (window.matchMedia('(max-width: 980px)').matches) {
      router.push(`/cell/${cellId}`)
      return
    }

    chooseCell(cellId)
  }

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

  const selectedExternalFormUrl = selectedCell
      ? buildExternalFormUrl({
          baseUrl: process.env.NEXT_PUBLIC_EXTERNAL_FORM_URL || DEFAULT_EXTERNAL_FORM_URL,
          cellId: selectedCell.id,
          topic: selectedCell.rowTitle,
        })
      : DEFAULT_EXTERNAL_FORM_URL

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="kicker">数据平权 · AI 下乡</div>
          <h1>牛马能力剥夺图</h1>
        </div>
        <div className="stats">
          <span>{loading ? '同步中' : `${approvedCount} 条已上墙`}</span>
          <button type="button" onClick={() => void loadSubmissions()} aria-label="刷新投稿">
            <RefreshCcw size={16} />
          </button>
        </div>
      </header>

      {dataOffline ? (
        <div className="notice notice-hidden" role="status">
          互动数据暂时没有连上，矩阵仍可浏览。
        </div>
      ) : null}

      <section className={panelOpen ? 'matrix-layout' : 'matrix-layout panel-closed'}>
        <div className="matrix-panel" aria-label="互动矩阵">
          <div className="column-strip">
            <div className="column-spacer" aria-hidden="true" />
            {columns.map((column) => (
              <div key={column.id} className="column-chip">
                <b>{column.title}</b>
                <span>{column.subtitle}</span>
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <section key={row.id} className="row-band">
              <div className="row-heading">
                <b>{row.title}</b>
                <span>{row.subtitle}</span>
              </div>

              <div className="cell-grid">
                {columns.map((column) => {
                  const cell = cells.find((item) => item.rowId === row.id && item.columnId === column.id)
                  if (!cell) return null
                  const approvedItems = submissions[cell.id] ?? []
                  const count = approvedItems.length

                  return (
                    <button
                      key={cell.id}
                      type="button"
                      className={cell.id === selectedCell?.id ? 'matrix-cell active' : 'matrix-cell'}
                      onClick={() => openCell(cell.id)}
                    >
                      <span className="cell-meta">
                        <b>{cell.id}</b>
                        <span>{column.title}</span>
                      </span>
                      <span className="cell-tags">
                        {cell.tags.slice(0, 2).map((tag) => (
                          <span key={`${cell.id}-${tag.text}`} className={tagClass[tag.tone]}>
                            {tag.tone === 'star' ? '★ ' : ''}
                            {tag.text}
                          </span>
                        ))}
                      </span>
                      {approvedItems.length > 0 ? (
                        <span className="cell-approved" aria-label={`${cell.id} 已上墙投稿`}>
                          {approvedItems.slice(0, 2).map((item) => (
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
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        <aside
          className={panelOpen ? 'submit-panel' : 'submit-panel panel-closed'}
          aria-hidden={!panelOpen}
        >
          <div className="panel-head">
            <div>
              <span className="selected-id">{selectedCell?.id}</span>
              <h2>
                {selectedCell?.columnTitle} × {selectedCell?.rowTitle}
              </h2>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => setPanelOpen(false)}
              aria-label="关闭投稿面板"
            >
              <X size={16} />
            </button>
          </div>

          <div className="external-submit-panel">
            <p>补充内容会跳转到飞书表单填写，WAM 页面不收集联系方式。</p>
            <a href={selectedExternalFormUrl} className="detail-submit-link" rel="noreferrer">
              补一条
              <MessageSquarePlus size={16} />
            </a>
          </div>
        </aside>
      </section>
    </main>
  )
}
