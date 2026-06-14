import configPromise from '@payload-config'
import { getPayload } from 'payload'

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const displayName = process.env.ADMIN_DISPLAY_NAME || '现场审核管理员'

if (!email || !password) {
  throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.')
}

const payload = await getPayload({ config: configPromise })

try {
  const existing = await payload.find({
    collection: 'cms-admins',
    limit: 1,
    pagination: false,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const admin = existing.docs[0]

    await payload.update({
      collection: 'cms-admins',
      id: admin.id,
      data: {
        email,
        password,
        displayName,
      },
      overrideAccess: true,
    })

    console.log(`Updated admin: ${email}`)
  } else {
    const created = await payload.create({
      collection: 'cms-admins',
      data: {
        email,
        password,
        displayName,
      },
      overrideAccess: true,
    })

    console.log(`Created admin: ${created.email}`)
  }
} finally {
  await payload.destroy()
}
