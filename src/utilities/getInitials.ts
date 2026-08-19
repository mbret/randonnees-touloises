/**
 * Initials to stand in for a missing portrait: "Pascal BRET" gives PB, a lone
 * first name gives one letter rather than doubling it.
 */
export const getInitials = (name?: string | null) => {
  const words = name?.trim().split(/\s+/).filter(Boolean) ?? []

  if (words.length === 0) return ''

  return [...new Set([words[0], words[words.length - 1]])]
    .map((word) => word?.[0]?.toUpperCase())
    .join('')
}
