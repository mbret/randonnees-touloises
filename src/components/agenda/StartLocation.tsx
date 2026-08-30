import React from 'react'

import type { AgendaLocation } from './groupEvents'

import { MapPinIcon } from 'lucide-react'
import { cn } from '@/components/ui'
import { mapUrl } from '@/utilities/mapLink'

/**
 * Where the walk starts, on the card.
 *
 * Given its own line directly under the title, in the foreground weight, rather
 * than left in the details below. It is the one thing on a card a reader has to
 * act on — everything else tells them whether to come, this tells them where to
 * be — and set as another grey line among the animateur and the kilométrage it
 * read as more of the same and was skimmed past. The pin icon does most of that
 * work: the eye finds a shape before it reads a word.
 *
 * The name is the link, not an icon beside it, so the tap target on a phone is
 * the whole line rather than a sixteen-pixel square. It opens whatever map the
 * reader already uses.
 *
 * A location with no coordinates renders as plain text — the two the club has
 * are a château reached by coach and a hall whose two links disagreed — because
 * a link that cannot say where it goes is worse than a name that admits it.
 */
export function StartLocation({
  className,
  location,
}: {
  className?: string
  location: AgendaLocation
}) {
  const href = mapUrl(location)

  const name = (
    <>
      <MapPinIcon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
      {location.title}
    </>
  )

  return (
    <p className={cn('text-foreground flex flex-col text-sm', className)}>
      {href ? (
        <a
          className="hover:text-primary flex w-fit items-start gap-1.5 font-medium underline decoration-dotted underline-offset-4"
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {name}
        </a>
      ) : (
        <span className="flex w-fit items-start gap-1.5 font-medium">{name}</span>
      )}

      {/* « Se garer côté rue », « le parking se remplit vite » — said once, on
          the place, rather than retyped into every event that meets there. */}
      {location.notes && (
        <span className="text-muted-foreground mt-0.5 pl-5 text-xs">{location.notes}</span>
      )}
    </p>
  )
}
