import { cacheLife } from 'next/cache'

import { todayInFrance } from './parisDay'

/**
 * Today in Toul, captured in a cache entry with an hourly life.
 *
 * Cache Components refuses a read of the current time while prerendering, since
 * the value would be frozen into the output and never move again. Reading it
 * inside a cached scope is the sanctioned way round that: the day is fixed for an
 * hour at a time, so a registration deadline that passes on its own is picked up
 * within the hour without an edit to the post.
 *
 * Pages that are themselves cached — the listings, the home page — do not need
 * this: their own `use cache` scope already covers the read. It is for the ones
 * that resolve a document per request.
 */
export const cachedTodayInFrance = async () => {
  'use cache'
  cacheLife('hours')

  return todayInFrance()
}
