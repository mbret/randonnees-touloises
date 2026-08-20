import React from 'react'

import type { ProgramEntry } from './getPrograms'

import { ItemGroup } from '@/components/ui/item'
import { ProgramCard } from './ProgramCard'

/** The entries as cards, or the reason there are none. */
export function ProgramList({ entries }: { entries: ProgramEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-center">
        Aucune sortie ni séjour n’est ouvert aux inscriptions pour le moment.
      </p>
    )
  }

  return (
    <ItemGroup className="gap-3">
      {entries.map((entry) => (
        <ProgramCard key={entry.slug} {...entry} />
      ))}
    </ItemGroup>
  )
}
