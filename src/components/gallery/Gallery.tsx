import { Media as MediaType } from '@/payload-types'
import { Media } from '../Media'
import { cn } from '../ui'

type GalleryImage = MediaType

type GallerySection = {
  type?: string
  images: GalleryImage[]
}

/**
 * One image to a row below `md` and two above it. A `grid` section halves its
 * own again, so this is the wider of the two arrangements rather than a value
 * true of every image — overstating it costs a larger file, understating it
 * costs a blurry one.
 */
const IMAGE_SIZES = '(min-width: 768px) 50vw, 100vw'

export const Gallery = ({ sections }: { sections: GallerySection[] }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className={cn({ 'grid grid-cols-2 gap-6': section.type === 'grid' })}
        >
          {section.images.map((image, imageIndex) => (
            <Media
              key={imageIndex}
              resource={image}
              imgClassName="rounded-lg object-cover"
              size={IMAGE_SIZES}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
