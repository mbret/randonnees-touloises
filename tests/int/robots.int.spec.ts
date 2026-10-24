import { describe, expect, it } from 'vitest'

import robots from '@/app/robots'

describe('robots.txt', () => {
  it('keeps crawlers off the admin and the search page', () => {
    expect(robots().rules).toMatchObject({ disallow: ['/admin', '/search'] })
  })
})
