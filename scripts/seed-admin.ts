import configPromise from '@payload-config'
import { getPayload } from 'payload'

const email = process.env.ADMIN_EMAIL || 'miyinderick@qq.com'
const password = process.env.ADMIN_PASSWORD || 'admin'
const displayName = process.env.ADMIN_DISPLAY_NAME || '现场审核管理员'

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
    console.log(`Password: ${password}`)
  }
} finally {
  await payload.destroy()
}
