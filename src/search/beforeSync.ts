import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

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
      description: meta?.description,
    },
  }

  return modifiedDoc
}
