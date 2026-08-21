import React from 'react'

/**
 * The day the post was written, at the foot of the article.
 *
 * It used to sit in the header, where it read as the date of the thing being
 * announced — which it is not. Down here it is what it actually is: a note about
 * the page, for anyone wondering how old what they are reading is.
 */
export function PublishedAt({ value }: { value?: string | null }) {
  if (!value) return null

  const label = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
    year: 'numeric',
  }).format(new Date(value))

  return (
    <p className="text-muted-foreground mt-12 border-t pt-6 text-sm">
      Publié le <time dateTime={value}>{label}</time>
    </p>
  )
}
