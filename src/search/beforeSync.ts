import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

import { publicDescription } from '@/seo/publicText'

export const beforeSyncWithSearch: BeforeSync = async ({ originalDoc, searchDoc }) => {
  const { schedule, slug, title, meta } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    schedule: { startDate: schedule?.startDate ?? null },
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: publicDescription(meta) ?? null,
    },
  }

  return modifiedDoc
}
