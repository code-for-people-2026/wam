import type { CollectionConfig } from 'payload'

export const CMSAdmins: CollectionConfig = {
  slug: 'cms-admins',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  labels: {
    singular: '管理员',
    plural: '管理员',
  },
  fields: [
    {
      name: 'displayName',
      label: '显示名',
      type: 'text',
      required: false,
    },
  ],
}
