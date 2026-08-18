import React from 'react'

export const RequiredMark: React.FC = () => (
  <>
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
    <span className="sr-only">(obligatoire)</span>
  </>
)
