'use client'

import type { PlannedUpdate, SyncPlan } from '@/collections/Adherents/sync/plan'

import { Banner, Button } from '@payloadcms/ui'
import React, { useMemo, useState } from 'react'

type Report = {
  applied?: { created: number; updated: number }
  digest: string
  error?: string
  plan: SyncPlan
  rowsRead: number
  stale?: boolean
  storedTotal: number
}

/** The sheet's fields, in the order the club's own export lists them. */
const FIELD_LABELS: Record<string, string> = {
  address: 'Adresse',
  birthDate: 'Naissance',
  city: 'Ville',
  civility: 'Civ.',
  email: 'E-mail',
  firstName: 'Prénom',
  lastName: 'Nom',
  licenceClub: 'Club',
  medicalCertificateDate: 'Certificat',
  phone: 'Téléphone',
  postalCode: 'CP',
  streetNumber: 'N°',
}

const FIELD_ORDER = [
  'civility',
  'lastName',
  'firstName',
  'birthDate',
  'phone',
  'email',
  'streetNumber',
  'address',
  'postalCode',
  'city',
  'licenceClub',
  'medicalCertificateDate',
]

const label = (field: string) =>
  FIELD_LABELS[field] ?? (field.startsWith('adhesion') ? field.replace('adhesion', 'Adhésion') : field)

const CIVILITY: Record<string, string> = { mme: 'Mme', mr: 'Mr' }
const STATUS: Record<string, string> = {
  active: 'À jour',
  former: 'Ancien',
  lapsed: 'Non renouvelé',
  pending: 'Attendu',
  prospect: 'À l’essai',
}

/** Dates are stored as timestamps but read as the club writes them. */
const show = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '—'

  if (typeof value === 'object') {
    const row = value as Record<string, unknown>
    const parts = [
      row.amountFfr !== null && row.amountFfr !== undefined ? `FFR ${row.amountFfr} €` : null,
      row.amountClub !== null && row.amountClub !== undefined ? `club ${row.amountClub} €` : null,
      row.paidOn ? `payé ${show(row.paidOn)}` : null,
    ].filter(Boolean)

    return parts.length > 0 ? parts.join(', ') : '—'
  }

  const text = String(value)
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(text)

  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`

  return CIVILITY[text] ?? text
}

const th: React.CSSProperties = {
  borderBottom: '1px solid var(--theme-elevation-150)',
  fontWeight: 600,
  padding: '.4rem .6rem',
  position: 'sticky',
  textAlign: 'left',
  top: 0,
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  borderBottom: '1px solid var(--theme-elevation-100)',
  padding: '.35rem .6rem',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
}

const Scroller: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ maxHeight: '30rem', overflow: 'auto' }}>
    <table style={{ borderCollapse: 'collapse', fontSize: '.8rem', width: '100%' }}>{children}</table>
  </div>
)

const Fold: React.FC<{ children: React.ReactNode; count: number; open?: boolean; title: string }> = ({
  children,
  count,
  open,
  title,
}) => {
  if (count === 0) return null

  return (
    <details open={open} style={{ marginBottom: '1.25rem' }}>
      <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '.5rem' }}>
        {title} — {count}
      </summary>
      {children}
    </details>
  )
}

/** One column per field that actually changed somewhere, so the table stays narrow. */
const changedFields = (updates: PlannedUpdate[]): string[] => {
  const seen = new Set<string>()

  for (const update of updates) for (const change of update.changes) seen.add(change.field)

  return [
    ...FIELD_ORDER.filter((field) => seen.has(field)),
    ...[...seen].filter((field) => !FIELD_ORDER.includes(field)).sort(),
  ]
}

/**
 * Reads the club's export in the browser, shows what an import would change, and
 * applies it once somebody has read that.
 *
 * The file never leaves this page except as the text of a request, and it goes
 * twice: once to be compared, once to be applied. Nothing is stored in between,
 * and in particular the file is never put in the media collection, which is
 * publicly readable — it carries every adhérent's home address and date of birth.
 */
export const AdherentsSyncScreen: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState<'analyse' | 'apply' | null>(null)
  const [error, setError] = useState<null | string>(null)
  const [report, setReport] = useState<null | Report>(null)

  const plan = report?.plan
  const updateColumns = useMemo(() => changedFields(plan?.updates ?? []), [plan])
  const pending = (plan?.creates.length ?? 0) + (plan?.updates.length ?? 0)

  const send = async (mode: 'analyse' | 'apply') => {
    if (!file) return

    setBusy(mode)
    setError(null)

    try {
      const response = await fetch('/api/adherents/sync', {
        body: JSON.stringify({
          apply: mode === 'apply',
          csv: await file.text(),
          ...(mode === 'apply' && report ? { digest: report.digest } : {}),
        }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      const body = await response.json()

      if (response.status === 409) {
        // The roster moved: show the plan as it stands now, unapplied.
        setReport(body as Report)
        setError(typeof body?.error === 'string' ? body.error : null)
        return
      }

      if (!response.ok) {
        setError(typeof body?.error === 'string' ? body.error : 'L’opération a échoué.')
        if (mode === 'analyse') setReport(null)
        return
      }

      setReport(body as Report)
    } catch {
      setError('L’opération n’a pas abouti. Réessayez.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="gutter--left gutter--right" style={{ paddingBottom: '4rem' }}>
      <h1 style={{ marginBottom: '.5rem' }}>Synchroniser avec l’export CSV</h1>
      <p style={{ color: 'var(--theme-elevation-600)', marginTop: 0 }}>
        Déposez l’export des adhérents. Rien n’est enregistré avant que vous ayez lu le rapport et
        confirmé.
      </p>

      {/**
       * The one thing a person has to know before trusting this, said before they
       * choose a file rather than in a note afterwards.
       */}
      <Banner type="error">
        <strong>Le fichier fait autorité sur les coordonnées.</strong> Si un adhérent a modifié son
        téléphone, son e-mail ou son adresse depuis son compte, l’import écrasera sa modification
        par ce que dit le fichier. Le rapport montre chaque changement, champ par champ : relisez-le
        avant de confirmer.
      </Banner>

      <div style={{ alignItems: 'flex-end', display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
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
        <Button buttonStyle="secondary" disabled={!file || busy !== null} onClick={() => send('analyse')}>
          {busy === 'analyse' ? 'Analyse…' : 'Analyser'}
        </Button>
      </div>

      {error ? <Banner type="error">{error}</Banner> : null}

      {report?.applied ? (
        <Banner type="success">
          <strong>Import effectué.</strong> {report.applied.created} adhérent(s) créé(s),{' '}
          {report.applied.updated} mis à jour.
        </Banner>
      ) : null}

      {plan ? (
        <div>
          <h2>Ce qu’un import ferait</h2>
          <p style={{ color: 'var(--theme-elevation-600)' }}>
            {report.rowsRead} ligne(s) lue(s), saison {plan.season}, comparées à{' '}
            {report.storedTotal} adhérent(s) enregistré(s).
          </p>

          <table style={{ borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
            <tbody>
              {(
                [
                  ['À créer', plan.creates.length],
                  ['À mettre à jour', plan.updates.length],
                  ['Inchangés', plan.unchanged],
                  ['Ignorés (sans licence)', plan.skipped.length],
                  ['Refusés', plan.rejected.length],
                  ['Absents du fichier', plan.absent.length],
                ] as [string, number][]
              ).map(([text, count]) => (
                <tr key={text}>
                  <th scope="row" style={{ ...td, fontWeight: 500, paddingRight: '1.5rem' }}>
                    {text}
                  </th>
                  <td style={{ ...td, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!report.applied && pending > 0 ? (
            <div style={{ marginBottom: '2rem' }}>
              <Button buttonStyle="primary" disabled={busy !== null} onClick={() => send('apply')}>
                {busy === 'apply'
                  ? 'Import en cours…'
                  : `Confirmer et importer (${pending} modification${pending > 1 ? 's' : ''})`}
              </Button>
              <p style={{ color: 'var(--theme-elevation-500)', fontSize: '.8rem', margin: '.5rem 0 0' }}>
                Tout ou rien : si une ligne échoue, aucune n’est enregistrée.
              </p>
            </div>
          ) : null}

          <Fold count={plan.updates.length} open title="À mettre à jour">
            <Scroller>
              <thead>
                <tr>
                  <th style={th}>Adhérent</th>
                  <th style={th}>Licence</th>
                  {updateColumns.map((field) => (
                    <th key={field} style={th}>
                      {label(field)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.updates.map((update) => {
                  const byField = new Map(update.changes.map((change) => [change.field, change]))

                  return (
                    <tr key={update.licence}>
                      <td style={{ ...td, fontWeight: 600 }}>{update.name}</td>
                      <td style={td}>{update.licence}</td>
                      {updateColumns.map((field) => {
                        const change = byField.get(field)

                        return (
                          <td key={field} style={td}>
                            {change ? (
                              <>
                                <span
                                  style={{
                                    color: 'var(--theme-elevation-500)',
                                    textDecoration: 'line-through',
                                  }}
                                >
                                  {show(change.from)}
                                </span>{' '}
                                <strong>{show(change.to)}</strong>
                              </>
                            ) : (
                              <span style={{ color: 'var(--theme-elevation-300)' }}>·</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </Scroller>
          </Fold>

          <Fold count={plan.creates.length} title="À créer">
            <Scroller>
              <thead>
                <tr>
                  <th style={th}>Licence</th>
                  <th style={th}>Situation</th>
                  {FIELD_ORDER.map((field) => (
                    <th key={field} style={th}>
                      {label(field)}
                    </th>
                  ))}
                  <th style={th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {plan.creates.map((create) => (
                  <tr key={create.licence}>
                    <td style={td}>{create.licence}</td>
                    <td style={td}>{STATUS[create.status] ?? create.status}</td>
                    {FIELD_ORDER.map((field) => (
                      <td
                        key={field}
                        style={{
                          ...td,
                          fontWeight: field === 'lastName' ? 600 : undefined,
                        }}
                      >
                        {show(create.fields[field as keyof typeof create.fields])}
                      </td>
                    ))}
                    <td style={{ ...td, whiteSpace: 'normal' }}>
                      {create.notes.length > 0 ? create.notes.join(' · ') : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Scroller>
          </Fold>

          <Fold count={plan.rejected.length} open title="Refusés">
            <Scroller>
              <tbody>
                {plan.rejected.map((row) => (
                  <tr key={row.line}>
                    <td style={td}>Ligne {row.line}</td>
                    <td style={{ ...td, whiteSpace: 'normal' }}>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </Scroller>
          </Fold>

          <Fold count={plan.skipped.length} title="Ignorés">
            <Scroller>
              <tbody>
                {plan.skipped.map((row) => (
                  <tr key={row.line}>
                    <td style={td}>Ligne {row.line}</td>
                    <td style={{ ...td, whiteSpace: 'normal' }}>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </Scroller>
          </Fold>

          <Fold count={plan.absent.length} title="Enregistrés mais absents de ce fichier">
            <p style={{ color: 'var(--theme-elevation-600)' }}>
              Rien ne leur arrive : un import ne supprime jamais personne, et un export filtré ne
              veut pas dire que ces adhérents ont quitté le club.
            </p>
            <Scroller>
              <tbody>
                {plan.absent.map((row) => (
                  <tr key={row.id}>
                    <td style={{ ...td, fontWeight: 600 }}>{row.name}</td>
                    <td style={td}>{row.licence ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </Scroller>
          </Fold>
        </div>
      ) : null}
    </div>
  )
}
