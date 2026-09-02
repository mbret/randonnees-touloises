'use client'

import type { SyncPlan } from '@/collections/Adherents/sync/plan'

import { Banner, Button } from '@payloadcms/ui'
import React, { useState } from 'react'

type Report = { plan: SyncPlan; rowsRead: number; storedTotal: number }

const cellStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--theme-elevation-100)',
  padding: '.35rem .75rem .35rem 0',
  textAlign: 'left',
  verticalAlign: 'top',
}

/** `null` and `undefined` both mean "nothing there" to someone reading a report. */
const readable = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, inner]) => `${key} ${readable(inner)}`)
      .join(', ')
  }

  return String(value).slice(0, 10) === String(value) ? String(value) : String(value)
}

const Section: React.FC<{ children: React.ReactNode; count: number; title: string }> = ({
  children,
  count,
  title,
}) => {
  if (count === 0) return null

  return (
    <details style={{ marginBottom: '1rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
        {title} — {count}
      </summary>
      <div style={{ marginTop: '.5rem' }}>{children}</div>
    </details>
  )
}

/**
 * Reads the club's export in the browser, sends its text to be compared against
 * the roster, and shows what an import would change.
 *
 * The file never leaves this page except as the text of one request. It is not
 * uploaded anywhere, and in particular not into the media collection, which is
 * publicly readable — this file carries every adhérent's home address and date
 * of birth.
 *
 * Nothing here can write. The endpoint it calls has no branch that does, so the
 * report is the whole of what this screen does; applying a plan is a separate
 * step still to be built.
 */
export const AdherentsSyncScreen: React.FC<{ defaultSeason: string }> = ({ defaultSeason }) => {
  const [season, setSeason] = useState(defaultSeason)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [report, setReport] = useState<null | Report>(null)

  const analyse = async () => {
    if (!file) return

    setBusy(true)
    setError(null)
    setReport(null)

    try {
      const response = await fetch('/api/adherents/sync', {
        body: JSON.stringify({ csv: await file.text(), season }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      const body = await response.json()

      if (!response.ok) {
        setError(typeof body?.error === 'string' ? body.error : 'La comparaison a échoué.')
        return
      }

      setReport(body as Report)
    } catch {
      setError('La comparaison n’a pas abouti. Réessayez.')
    } finally {
      setBusy(false)
    }
  }

  const plan = report?.plan

  return (
    <div className="gutter--left gutter--right" style={{ maxWidth: '60rem', paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '.5rem' }}>Comparer avec l’export FFRandonnée</h1>
      <p style={{ color: 'var(--theme-elevation-600)', marginTop: 0 }}>
        Déposez l’export des adhérents. Rien n’est enregistré : cet écran dit seulement ce qu’un
        import changerait.
      </p>

      {/**
       * The one thing a person needs to know before trusting this, said before
       * they use it rather than in a note afterwards. It is not a limitation of
       * the report — the report is honest — it is a limitation of the sheet
       * winning every time it has an opinion.
       */}
      <Banner type="error">
        <strong>Le fichier fait autorité sur les coordonnées.</strong> Si un adhérent a modifié son
        téléphone, son e-mail ou son adresse depuis son compte, un import écrasera sa modification
        par ce que dit le fichier. Le rapport ci-dessous montre chaque changement, ligne par ligne :
        lisez-le avant de conclure.
      </Banner>

      <div style={{ display: 'grid', gap: '1rem', margin: '1.5rem 0', maxWidth: '30rem' }}>
        <div>
          <label htmlFor="adherents-sync-file" style={{ display: 'block', marginBottom: '.25rem' }}>
            Fichier CSV
          </label>
          <input
            accept=".csv,text/csv"
            id="adherents-sync-file"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null)
              setReport(null)
              setError(null)
            }}
            type="file"
          />
        </div>

        <div>
          <label
            htmlFor="adherents-sync-season"
            style={{ display: 'block', marginBottom: '.25rem' }}
          >
            Saison
          </label>
          <input
            className="field-type text"
            id="adherents-sync-season"
            onChange={(event) => setSeason(event.target.value)}
            placeholder="2026/2027"
            style={{ maxWidth: '10rem' }}
            type="text"
            value={season}
          />
          <p style={{ color: 'var(--theme-elevation-500)', fontSize: '.8rem', margin: '.25rem 0 0' }}>
            L’export ne porte pas la saison. Celle-ci est déduite de la date du jour — corrigez-la
            si vous importez le fichier d’une autre saison.
          </p>
        </div>

        <div>
          <Button buttonStyle="primary" disabled={!file || busy} onClick={analyse}>
            {busy ? 'Analyse…' : 'Analyser le fichier'}
          </Button>
        </div>
      </div>

      {error ? <Banner type="error">{error}</Banner> : null}

      {plan ? (
        <div>
          <h2>Ce qu’un import ferait</h2>
          <p style={{ color: 'var(--theme-elevation-600)' }}>
            {report.rowsRead} ligne(s) lue(s) pour la saison {plan.season}, comparées à{' '}
            {report.storedTotal} adhérent(s) enregistré(s).
          </p>

          <table style={{ borderCollapse: 'collapse', marginBottom: '1.5rem', width: '100%' }}>
            <tbody>
              {[
                ['À créer', plan.creates.length],
                ['À mettre à jour', plan.updates.length],
                ['Inchangés', plan.unchanged],
                ['Ignorés (sans licence)', plan.skipped.length],
                ['Refusés', plan.rejected.length],
                ['Absents du fichier', plan.absent.length],
              ].map(([label, count]) => (
                <tr key={String(label)}>
                  <th scope="row" style={cellStyle}>
                    {label}
                  </th>
                  <td style={{ ...cellStyle, fontVariantNumeric: 'tabular-nums' }}>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Section count={plan.creates.length} title="À créer">
            <ul>
              {plan.creates.map((create) => (
                <li key={create.licence}>
                  <strong>{create.name}</strong> — licence {create.licence},{' '}
                  {create.status === 'active' ? 'à jour' : 'renouvellement attendu'}
                  {create.notes.length > 0 ? ` · ${create.notes.join(' · ')}` : ''}
                </li>
              ))}
            </ul>
          </Section>

          <Section count={plan.updates.length} title="À mettre à jour">
            {plan.updates.map((update) => (
              <div key={update.licence} style={{ marginBottom: '1rem' }}>
                <strong>{update.name}</strong> — licence {update.licence}
                <table style={{ borderCollapse: 'collapse', marginTop: '.25rem', width: '100%' }}>
                  <tbody>
                    {update.changes.map((change) => (
                      <tr key={change.field}>
                        <th scope="row" style={cellStyle}>
                          {change.field}
                        </th>
                        <td style={cellStyle}>{readable(change.from)}</td>
                        <td style={cellStyle}>→ {readable(change.to)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {update.notes.length > 0 ? <em>{update.notes.join(' · ')}</em> : null}
              </div>
            ))}
          </Section>

          <Section count={plan.rejected.length} title="Refusés">
            <ul>
              {plan.rejected.map((row) => (
                <li key={row.line}>
                  Ligne {row.line} — {row.reason}
                </li>
              ))}
            </ul>
          </Section>

          <Section count={plan.skipped.length} title="Ignorés">
            <ul>
              {plan.skipped.map((row) => (
                <li key={row.line}>
                  Ligne {row.line} — {row.reason}
                </li>
              ))}
            </ul>
          </Section>

          <Section count={plan.absent.length} title="Enregistrés mais absents de ce fichier">
            <p style={{ color: 'var(--theme-elevation-600)' }}>
              Rien ne leur arrive : un import ne supprime jamais personne, et un export filtré ne
              veut pas dire que ces adhérents ont quitté le club.
            </p>
            <ul>
              {plan.absent.map((row) => (
                <li key={row.id}>
                  {row.name} {row.licence ? `— licence ${row.licence}` : ''}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      ) : null}
    </div>
  )
}
