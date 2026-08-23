import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * Refreshes what the site reads out of the media collection: the favicon, the
 * logo and the sharing image the chrome is built from, and the portraits the
 * trombinoscope and the two team pages look up by filename.
 *
 * Both readers already tagged their entries `medias`; nothing fired it, so
 * replacing one of those files waited on a window — or, before those readers had
 * a window at all, on a deploy. The pages built on this hold nothing else from
 * the database, so this is the only thing that can move them.
 */
const revalidateMedias = (log: (message: string) => void) => {
  log('Revalidating the site media')

  revalidateTag('medias', { expire: 0 })
}

export const revalidateMedia: CollectionAfterChangeHook = ({ doc, req: { context, payload } }) => {
  if (!context.disableRevalidate) {
    revalidateMedias((message) => payload.logger.info(message))
  }

  return doc
}

export const revalidateMediaDelete: CollectionAfterDeleteHook = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidateMedias((message) => payload.logger.info(message))
  }

  return doc
}
