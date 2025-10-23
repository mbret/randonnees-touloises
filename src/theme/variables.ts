let styles =
  typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement)
    : {
        getPropertyValue: () => undefined,
      }

export const cssVariables = {
  breakpoints: {
    sm: styles.getPropertyValue('--breakpoint-sm'),
    md: styles.getPropertyValue('--breakpoint-md'),
    lg: styles.getPropertyValue('--breakpoint-lg'),
    xl: styles.getPropertyValue('--breakpoint-xl'),
    '2xl': styles.getPropertyValue('--breakpoint-2xl'),
    '3xl': styles.getPropertyValue('--breakpoint-3xl'),
  },
}
