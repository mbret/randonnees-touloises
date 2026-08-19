import Image from 'next/image'
import React from 'react'

/**
 * Full-bleed opening section of the home page: a hiking photo darkened just
 * enough for the club name, its founding year and its address to stay readable
 * on top.
 */
export function HomeHero() {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden md:min-h-[80vh]">
      <Image
        alt=""
        aria-hidden
        className="-z-10 object-cover"
        fill
        priority
        sizes="100vw"
        src="/about-hero.webp"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/50" />

      <div className="container py-24 text-center text-white">
        <h1 className="text-4xl font-bold tracking-tight text-balance uppercase drop-shadow-lg sm:text-6xl lg:text-7xl">
          Randonnées Touloises
        </h1>
        <p className="mt-6 text-xl font-medium drop-shadow-md sm:text-2xl">depuis 1987</p>

        <address className="mt-16 text-base leading-relaxed font-medium text-white/90 not-italic drop-shadow-md sm:mt-24 sm:text-lg">
          Maison des Associations
          <br />
          2, cours Raymond Poincaré
          <br />
          54200 Toul
        </address>
      </div>
    </section>
  )
}
