/**
 * How long the admin waits, after an editor stops typing, before writing an
 * autosaved draft — shared by the two collections that autosave, so the two
 * cannot drift apart.
 *
 * The Payload template shipped 100ms, for the snappiest live preview. It also
 * means a version write every tenth of a second while somebody types, so a
 * manual Save or Publish very often lands while an autosave is still in flight
 * to the database. Two overlapping writes each insert a row in the version
 * table (`_pages_v`, `_posts_v`) flagged `latest`, and neither demotes the
 * other: Payload clears the previous latest in a second statement — `UPDATE …
 * SET latest = false WHERE updated_at < <new>` — which cannot see a row a
 * concurrent transaction has yet to commit. The list view reads `latest = true`
 * and maps each row back to its parent, so the document then appears twice in
 * the list, both rows linking to the same id.
 *
 * A wider interval makes that overlap rare rather than routine. It cannot make
 * it impossible — the race is Payload's, not ours — so a duplicate can still
 * turn up; re-saving the document writes a version newer than both and clears
 * it.
 *
 * Payload's own default is 2000ms. Half of that keeps the live preview close
 * enough to live while making an overlapping write the exception rather than
 * the rule.
 */
export const AUTOSAVE_INTERVAL = 1000
