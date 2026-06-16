# WAM

Worker Ability Matrix, abbreviated as WAM, is an interactive matrix for collecting, moderating, and publishing worker pain points and product ideas.

This repository contains only the WAM web application. It is currently deployed as a standalone site and is expected to migrate later into a Code for People website subpage.

## Stack

- Next.js
- Payload CMS
- PostgreSQL
- Vercel

## Local Development

```bash
pnpm install
pnpm dev
```

The app runs on `http://localhost:1050`.

## Environment

Copy `.env.example` to `.env.local` and configure:

- `PAYLOAD_DATABASE_URL` or `DATABASE_URL`
- `DATABASE_URL_UNPOOLED`, if your database provider exposes it
- `PAYLOAD_DATABASE_SCHEMA=wam_interactive`
- `PAYLOAD_SECRET`
- `SUBMISSION_IP_HASH_SALT`
- `NEXT_PUBLIC_SITE_URL`
- `FEISHU_WEBHOOK_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Production Init

```bash
vercel login
pnpm prod:init
```

## QR Code

```bash
NEXT_PUBLIC_EXTERNAL_FORM_URL=https://qcng630f2p1h.feishu.cn/share/base/form/shrcnWYQXZRpgUhfBhYDSMSjVUg pnpm qr:flyer
```

## External Submission Form

The public site links `补一条` to an external Feishu form. WAM does not collect contact details on the public page; the Feishu form may ask for optional reviewer-only contact details.

The default Feishu form URL is configured with `NEXT_PUBLIC_EXTERNAL_FORM_URL`. WAM appends visible prefill parameters for `所属格子` and `能力区域`, so visitors entering from a matrix cell can still see and adjust the selected context.

Recommended Feishu form questions:

- `所属格子`: single choice, required. Use options such as `A1`, `B1`, ..., `H7`.
- `能力区域`: single choice, required. Use the seven row titles from the matrix.
- `补充类型`: single choice, required. Suggested options: `痛点`, `观察`, `产品点子`, `已有产品或服务`, `其他`.
- `具体补充内容`: text, required.
- `署名`: text, optional.
- `联系方式`: text, optional. Show that it is only for review follow-up and will not be public.

## Feishu Webhook Import

Configure Feishu Base automation to send an HTTP request when a form response creates a new record.

- Method: `POST`
- URL: `https://wam.codeforpeople.cn/api/feishu/submissions`
- Header: `x-wam-webhook-secret: <FEISHU_WEBHOOK_SECRET>`
- Body type: JSON

```json
{
  "所属格子": "{{所属格子}}",
  "能力区域": "{{能力区域}}",
  "补充类型": "{{补充类型}}",
  "具体补充内容": "{{具体补充内容}}",
  "署名": "{{署名}}",
  "联系方式": "{{联系方式}}"
}
```

The webhook creates a `pending` item in Payload Admin under `互动矩阵` / `矩阵投稿审核`.
## Checks

```bash
pnpm lint
pnpm test
pnpm build
```
