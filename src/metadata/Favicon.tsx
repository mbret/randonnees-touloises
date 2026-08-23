import { getCachedMedias } from './getMedias'
import { getMediaUrl } from '@/utilities/getMediaUrl'

export const Favicon = async () => {
  const medias = await getCachedMedias()
  const faviconMedia = medias.find((media) => media.filename === 'favicon')

  return (
    <>
      {faviconMedia ? (
        <link
          href={getMediaUrl(faviconMedia.url, faviconMedia.updatedAt) || '/favicon.ico'}
          type={faviconMedia.mimeType ?? 'image/x-icon'}
          rel="icon"
          sizes={faviconMedia.width ? `${faviconMedia.width}x${faviconMedia.height}` : '32x32'}
        />
      ) : (
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
      )}
    </>
  )
}
