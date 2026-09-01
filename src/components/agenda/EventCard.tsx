import React from 'react'

import type { AgendaEvent } from './groupEvents'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { cn } from '@/components/ui'
import { StartLocation } from './StartLocation'
import { StartLocationMap } from './StartLocationMap'

/**
 * A single event: the club's pictogram and the departure and return times down
 * the leading column, then the kind of walk, where it starts, and the rest of
 * the details as the editor laid them out.
 *
 * The meeting point is the one detail lifted out of that rich text and given a
 * line of its own, because it is the only one a reader has to act on. The
 * animateur, the kilométrage and the dénivelé stay in the text, in the order the
 * editor chose — the card imposes none on them.
 *
 * The logo goes in the leading column rather than beside the name because that
 * column is already a fixed `w-14`: the tile costs the details not a pixel of
 * width, which is what it would cost in a column of its own. And a day is read
 * down that edge — orange, blue, orange — the way the printed programme is
 * read, which is exactly what a pictogram beside the name cannot do.
 *
 * A walk with no category simply has no tile. Nothing stands in for it: a grey
 * square in that space reads as an image that failed to load, where an absence
 * reads as what it is.
 *
 * Below 480 px the column stops being a column: it takes a line of its own
 * above the details and lies down across it, the tile beside the times, 40 px
 * of height instead of the 88 px it costs stacked. What it was protecting on a
 * phone is nothing — a leading column narrows the details by its own width plus
 * a gap, and the details are the part with no room to spare.
 *
 * That line is claimed outright, with `w-full`, rather than left to `Item`'s
 * `flex-wrap`. Wrapping only fires when the details' *minimum* width no longer
 * fits beside the column, and their minimum is the longest unbreakable run in
 * them — a word, or a `maps.app.goo.gl` link still pasted in the body text.
 * That is far narrower than the width the details want, so a phone sails past
 * 480 px with the column still beside them: the tile lay down as intended and
 * the details never moved, which is the one arrangement nobody designed. Only a
 * viewport narrow enough to break that longest run would have wrapped it.
 *
 * So 480 px decides both halves of the switch, and the details keep the whole
 * width of a phone. `justify-start` comes with the full width: `ItemMedia`
 * centres its contents, which shrink-wrapped was invisible and across a whole
 * line would float the tile into the middle of the card.
 *
 * Down the other edge, from `md` up, is a little map of the start — see
 * `StartLocationMap` for why it is there and why a phone does not get one. It is
 * the only part of the card that is not text, and the only part that is not
 * something an editor typed.
 *
 * The details deliberately opt out of `prose`: it caps its width at 65ch and
 * centres what is left, which indents the text away from the title, and it sizes
 * headings for an article rather than a card. The few marks that survive in this
 * space are styled here instead.
 */
export function EventCard({
  content,
  credential,
  endTime,
  logo,
  startLocation,
  startTime,
  summary,
  title,
}: AgendaEvent) {
  return (
    <Item variant="outline">
      {(logo || startTime) && (
        <ItemMedia className="w-full flex-row items-center justify-start gap-3 min-[480px]:w-14 min-[480px]:flex-col min-[480px]:items-start min-[480px]:gap-2">
          {logo && (
            /* The alt text comes from the media record and is empty there on
             * purpose: the category's name is printed beside the tile, so a
             * screen reader that announced the image would say « Grande »
             * twice. The tile is decoration for a name already given. */
            <Media htmlElement={null} imgClassName="size-10" resource={logo} size="40px" />
          )}
          {startTime && (
            <div className="flex flex-col font-mono text-sm font-medium tabular-nums">
              <time>{startTime}</time>
              {endTime && <time className="text-muted-foreground font-normal">{endTime}</time>}
            </div>
          )}
        </ItemMedia>
      )}
      <ItemContent>
        {/* `flex-wrap` because `ItemTitle` has none of its own and is `w-fit`:
         * a long intitulé plus the label would not wrap, it would overflow the
         * card, and the part pushed out would be the label — the one part a
         * regulation requires. An editor types the intitulé, so its length is
         * not ours to bound. Wrapping costs a second line on the few cards
         * that need it, and makes true what the note below already claimed. */}
        {title && (
          <ItemTitle className="flex-wrap text-base">
            {title}
            {/* The category's figures, set as data next to a name — the same
             * treatment the times get. `ItemTitle` is already a flex row, so
             * the pair wraps as a unit on a narrow card. */}
            {summary && (
              <span className="text-muted-foreground font-mono text-xs font-normal">{summary}</span>
            )}
            {/* The label the walk is obliged to be announced with, beside the
             * name it qualifies. Sized to the title's line rather than to its
             * own small print: at 22 px « label Santé » reads and the
             * FFRandonnée wordmark under it does not, which the requirement
             * allows — the label has to be there, not to be readable. Anything
             * large enough to carry that wordmark would be taller than the
             * line and would push the two apart on every santé card.
             *
             * Its alt text comes from the media record, and unlike the
             * pictogram's it must not be empty: the tile repeats a name printed
             * beside it, where this says something written nowhere else on the
             * card. */}
            {credential && (
              <Media
                htmlElement={null}
                imgClassName="h-[22px] w-auto shrink-0"
                resource={credential}
                size="39px"
              />
            )}
          </ItemTitle>
        )}
        {startLocation && <StartLocation className="mt-0.5" location={startLocation} />}
        {content && (
          <RichText
            className={cn(
              'text-muted-foreground space-y-1 text-sm',
              '[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary',
              '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5',
              '[&_:is(h1,h2,h3,h4)]:text-foreground [&_:is(h1,h2,h3,h4)]:font-semibold',
            )}
            data={content}
            enableGutter={false}
            enableProse={false}
          />
        )}
      </ItemContent>
      {/* Last in the source and last in the row: the map is the one block on
          the card that a reader can also do without, and on a phone it is not
          drawn at all. Putting it here means the order the card is read in and
          the order it is laid out in are the same one. */}
      {startLocation && <StartLocationMap location={startLocation} />}
    </Item>
  )
}
