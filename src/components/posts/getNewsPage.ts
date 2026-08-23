import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import { withoutPrograms } from '@/components/programs/filters'
import { NEWS_PAGE_SIZE } from '@/utilities/postPath'

/**
 * One page of the actualités listing.
 *
 * Shared by `/news` and `/news/page/[pageNumber]`, which ask the same question
 * and differ only in which page they want — page one of the listing is served at
 * both addresses, so this is also what keeps the two from disagreeing.
 *
 * Cached under the news tag, which `revalidatePost` fires whenever a write
 * touches the listing, so a published post appears immediately. The ten minute
 * window behind it is only the backstop for what changes without a write.
 */
export const getNewsPage = async (page: number) => {
  'use cache'
  cacheLife('listing')
  cacheTag('news')

  const payload = await getPayload({ config: configPromise })

  return payload.find({
    collection: 'posts',
    depth: 1,
    limit: NEWS_PAGE_SIZE,
    overrideAccess: false,
    page,
    where: withoutPrograms,
  })
}
