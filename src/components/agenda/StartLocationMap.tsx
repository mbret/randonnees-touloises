import React from 'react'

import type { AgendaLocation } from './groupEvents'

import { MapPinIcon } from 'lucide-react'
import { cn } from '@/components/ui'
import { mapMosaic } from '@/utilities/mapTiles'
import { mapUrl } from '@/utilities/mapLink'

/**
 * A little map of where the walk starts, down the right-hand edge of the card.
 *
 * The name of a place answers « where » only for someone who already knows the
 * place: « Villey-le-Sec, parking de la mairie » tells a member of ten years
 * everything and a newcomer nothing.
 *
 * A hundred pixels do not settle it either — the link on the name is still the
 * thing a walker opens the evening before, and this square is far too small to
 * work out a route from. What it does is put the place *somewhere*
 * before the reader has clicked anything: which side of Toul, in a village or
 * out in the fields, by the river or up on the plateau. The rest of what it is
 * doing is being pleasant to look at, and it is sized accordingly — see below.
 *
 * Four raster tiles and a pin: no map library, no key, no client-side
 * JavaScript, and nothing that runs on hydration. `mapTiles` works out which
 * four and where the point falls in them, the `/map-tiles` route fetches them
 * from OpenStreetMap so that the reader's browser never has to, and the square
 * here is `overflow-hidden` with the tiles shifted under it — see the note on
 * the layer below. That is the whole of the mechanism.
 *
 * It is a *second* way of saying what `StartLocation` already says, so the whole
 * square is `aria-hidden` and out of the tab order: a screen reader announces
 * the name and its link once, and the map is the picture beside them.
 *
 * Two things in it are still clickable, and neither may contain the other. The
 * square opens the same map the name links to, because a map that ignores a
 * click reads as broken; the credit goes to OpenStreetMap's copyright page,
 * because their attribution guidance asks that it does. An `<a>` cannot be
 * nested in an `<a>`, so the frame is a plain box, the map's link is a
 * transparent sheet laid over the tiles, and the credit sits on top of it.
 *
 * Hidden below `md`, where the card gives its whole width to the details and
 * every block in it takes a line of its own. A square this size would be a
 * third of a phone screen, and would push the times, the name and the details
 * into a column too narrow for any of them.
 */
export function StartLocationMap({ location }: { location: AgendaLocation }) {
  const mosaic = mapMosaic(location)
  const href = mapUrl(location)

  /* Both are the same condition read twice — a place with no coordinates has
   * neither tiles nor a link — and both are checked so neither can be assumed
   * away here. `StartLocation` still prints the name as plain text. */
  if (!mosaic || !href) return null

  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-muted relative hidden shrink-0 self-start overflow-hidden rounded-md border',
        /**
         * A square with a side of its own, held at the top — not a square
         * derived from the card, and not one that stretches to it.
         *
         * `aspect-square` cannot express a square derived from the card anyway:
         * it sizes a flex item from its *height*, and the card's height comes
         * from the card's contents, so the browser resolves the circle by
         * giving the map its content width, which here is zero. Stretching the
         * height instead was tried and dropped: past 256 px the mosaic has no
         * more map to show, so a long card got a portrait strip that was
         * neither square nor flush with it.
         *
         * The side is 100 px because a map that decides how tall the cards are
         * is charging the whole agenda for a decoration. At 160 px it was the
         * tallest thing on a card and every mapped card came out 194 px, where
         * the details alone wanted 108 — and being 60 px wider, it also
         * narrowed the details enough to wrap a long card onto an extra line.
         * At 100 px the arithmetic goes quiet: a card with two paragraphs is the
         * height it was before this existed, and only the emptiest card is
         * stretched at all, from 108 px to 134.
         *
         * `self-start` for the cards where the details are the taller half: the
         * square sits level with the title and the name it illustrates, and the
         * space beside the paragraphs below reads as the card's own margin
         * rather than as a map that failed to fill.
         *
         * 100 px also sits well inside the 128 px of map the mosaic guarantees
         * in every direction around the pin, so the window is always covered.
         */
        'size-25',
        'md:block',
      )}
      title="Fond de carte © OpenStreetMap"
    >
      {/*
       * Dimmed and desaturated in dark mode. The tiles are drawn for a white
       * page — nothing else about them changes with the theme — and at full
       * strength the square is the brightest thing on a dark card by some
       * distance. Inverting them, the other common trick, turns the greens grey
       * and the water pink; taking the brightness down leaves a map that still
       * looks like one.
       *
       * The pin is a sibling rather than a child of this layer, so it keeps the
       * club's orange at full strength in both themes.
       *
       * The mosaic's top-left corner is put at the centre of the square and then
       * pulled back by where the pin falls inside it, which lands the pin in the
       * middle. Inline styles because these are the coordinates of one place:
       * they change with every card, which is exactly what a stylesheet cannot
       * express.
       */}
      <div
        className="absolute top-1/2 left-1/2 grid grid-cols-2 dark:brightness-75 dark:saturate-75"
        style={{
          height: mosaic.size,
          transform: `translate(${-mosaic.left}px, ${-mosaic.top}px)`,
          width: mosaic.size,
        }}
      >
        {mosaic.tiles.map((tile) => (
          /*
           * A plain `img`, not `next/image`, which has nothing to do here.
           *
           * Its work is resizing, re-encoding and picking a candidate per
           * viewport. A tile arrives 256 px square and is drawn 256 px square —
           * the window over the mosaic is what makes the map small, not any
           * scaling of these images — so there is one size, no `srcset` to
           * choose from, and nothing to resize. What is left is a re-encode of a
           * PNG that a tile server already cut for this purpose, at a
           * per-transformation price, into a second cache in front of the CDN
           * cache the `/map-tiles` route already gets. And `loading="lazy"`,
           * which is the part that actually matters on a page holding a month of
           * walks, is a plain attribute that needs no help.
           */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="max-w-none"
            decoding="async"
            height={mosaic.tileSize}
            key={tile.url}
            loading="lazy"
            src={tile.url}
            style={{ height: mosaic.tileSize, width: mosaic.tileSize }}
            width={mosaic.tileSize}
          />
        ))}
      </div>

      {/*
       * The pin: the same one the name carries under the title, filled in the
       * club's orange and outlined in white so it reads on a map's greens and
       * greys rather than on the card. Drawn, not fetched — it is the one thing
       * on the square that is not map.
       *
       * Its tip is the point. The translate lifts it by its own height, so the
       * pin stands on the location instead of covering it.
       */}
      <MapPinIcon
        className="fill-brand-orange absolute top-1/2 left-1/2 size-5 -translate-x-1/2 -translate-y-full stroke-white drop-shadow-[0_1px_1px_rgb(0_0_0/0.45)]"
        strokeWidth={1.5}
      />

      {/*
       * The map's own link, as a sheet over the tiles rather than a box round
       * them, so that the credit can be a link of its own. It covers the pin as
       * well: the pin is the place, and opening the place is the one thing this
       * square can usefully do with a click.
       */}
      <a
        className="absolute inset-0"
        href={href}
        rel="noopener noreferrer"
        tabIndex={-1}
        target="_blank"
      />

      {/*
       * Attribution, which is what the tile server asks for in return — and it
       * asks specifically that the credit link to its copyright page, so this is
       * a link, sitting on top of the sheet above rather than inside it. It
       * travels with the map rather than sitting once at the foot of the page,
       * so the credit cannot be left behind by whatever else shows a card later.
       *
       * Abbreviated, which OpenStreetMap's own guidance allows where a map is
       * too small to carry the full credit: spelled out it ran 81 px wide across
       * a 100 px square and became the thing the eye landed on. The whole of it
       * is in the frame's `title`, a hover away.
       */}
      <a
        className="bg-background/75 text-muted-foreground hover:text-foreground absolute right-0 bottom-0 rounded-tl-sm px-1 text-[9px] leading-4"
        href="https://www.openstreetmap.org/copyright"
        rel="noopener noreferrer"
        tabIndex={-1}
        target="_blank"
      >
        © OSM
      </a>
    </div>
  )
}
