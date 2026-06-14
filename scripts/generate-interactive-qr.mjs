import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import QRCode from 'qrcode'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://wam.codeforpeople.cn/'

const publicDir = resolve('public')
const outputPath = resolve(publicDir, 'qr-interactive.svg')
const svg = await QRCode.toString(siteUrl, {
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
console.log(`QR target: ${siteUrl}`)
