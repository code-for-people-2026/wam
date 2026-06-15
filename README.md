# WAM

Worker Ability Map, abbreviated as WAM, is an interactive matrix for collecting, moderating, and publishing worker pain points and product ideas.

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
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Production Init

```bash
vercel login
pnpm prod:init
```

## QR Code

```bash
NEXT_PUBLIC_SITE_URL=https://wam.codeforpeople.cn pnpm qr:flyer
```

## External Submission Form

The public site links `补一条` to an external Feishu form. WAM does not collect contact details on the public page.

The default Feishu form URL is configured with `NEXT_PUBLIC_EXTERNAL_FORM_URL`. WAM appends hidden prefill parameters for `所属格子` and `能力区域`, so visitors only need to fill `具体补充内容`.
## Checks

```bash
pnpm lint
pnpm test
pnpm build
```
