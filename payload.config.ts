import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import { CMSAdmins } from './src/payload/collections/CMSAdmins'
import { MatrixSubmissions } from './src/payload/collections/MatrixSubmissions'

function normalizePGSSLMode(url: string): string {
  if (!url) {
    return url
  }

  if (url.includes('sslmode=require')) {
    return url.replace(/sslmode=require/g, 'sslmode=verify-full')
  }

  return url
}

const databaseURL = normalizePGSSLMode(
  process.env.PAYLOAD_DATABASE_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    'postgresql://postgres:postgres@127.0.0.1:5432/postgres'
)

const allowSchemaPush =
  process.env.PAYLOAD_DB_PUSH === 'true' &&
  process.env.PAYLOAD_ALLOW_DESTRUCTIVE_PUSH === 'true'

const schemaName = process.env.PAYLOAD_DATABASE_SCHEMA || 'wam_interactive'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'wam-interactive-matrix-dev-secret-change-me',
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL,
    },
    push: allowSchemaPush,
    schemaName,
  }),
  admin: {
    user: 'cms-admins',
    importMap: {
      autoGenerate: false,
    },
  },
  collections: [CMSAdmins, MatrixSubmissions],
})
