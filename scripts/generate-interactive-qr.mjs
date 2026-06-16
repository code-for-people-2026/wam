import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import QRCode from 'qrcode'

const defaultExternalFormUrl =
  'https://qcng630f2p1h.feishu.cn/share/base/form/shrcnWYQXZRpgUhfBhYDSMSjVUg'
const qrTargetUrl =
  process.env.QR_TARGET_URL ||
  process.env.NEXT_PUBLIC_EXTERNAL_FORM_URL ||
  process.env.EXTERNAL_FORM_URL ||
  defaultExternalFormUrl

const publicDir = resolve('public')
const outputPath = resolve(publicDir, 'qr-interactive.svg')
const svg = await QRCode.toString(qrTargetUrl, {
  type: 'svg',
  margin: 1,
  width: 420,
  color: {
    dark: '#1a1a1a',
    light: '#ffffff',
  },
})

await mkdir(publicDir, { recursive: true })
await writeFile(outputPath, svg)

console.log(`Generated ${outputPath}`)
console.log(`QR target: ${qrTargetUrl}`)
