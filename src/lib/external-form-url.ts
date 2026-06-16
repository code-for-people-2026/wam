type ExternalFormUrlInput = {
  baseUrl: string
  cellId: string
  topic: string
}

export const DEFAULT_EXTERNAL_FORM_URL =
  'https://qcng630f2p1h.feishu.cn/share/base/form/shrcnWYQXZRpgUhfBhYDSMSjVUg'

export function buildExternalFormUrl({ baseUrl, cellId, topic }: ExternalFormUrlInput) {
  const url = new URL(baseUrl)
  url.searchParams.set('prefill_所属格子', cellId)
  url.searchParams.set('prefill_能力区域', topic)
  return url.toString()
}
