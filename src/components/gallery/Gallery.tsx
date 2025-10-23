import { Media as MediaType } from '@/payload-types'
import { Media } from '../Media'
import { cn } from '../ui'

type GalleryImage = MediaType

type GallerySection = {
  type?: string
  images: GalleryImage[]
}

export const Gallery = ({ sections }: { sections: GallerySection[] }) => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className={cn({ 'grid grid-cols-2 gap-6': section.type === 'grid' })}
        >
          {section.images.map((image, imageIndex) => (
            <Media key={imageIndex} resource={image} imgClassName="rounded-lg object-cover" />
          ))}
        </div>
      ))}
    </div>
  )
}
