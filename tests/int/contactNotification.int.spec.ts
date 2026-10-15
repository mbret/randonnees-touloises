import { beforeEach, describe, expect, it, vi } from 'vitest'

const create = vi.fn()
const findGlobal = vi.fn()
const sendEmail = vi.fn()
const logError = vi.fn()
const pending: Promise<unknown>[] = []

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: async () => ({ create, findGlobal, logger: { error: logError }, sendEmail }),
}))
/* Outside a request `after` throws; here it runs the work and keeps it to await. */
vi.mock('next/server', () => ({
  after: (task: () => Promise<unknown>) => pending.push(task()),
}))

const { submitContact } = await import('@/components/contacts/actions')

const submit = async (overrides: object = {}) => {
  const result = await submitContact({
    email: 'jeanne@example.net',
    message: 'Bonjour,\nPuis-je venir à la sortie de dimanche ?',
    nom: 'Jeanne Dupont',
    telephone: '06 12 34 56 78',
    ...overrides,
  })
  await Promise.all(pending.splice(0))

  return result
}

beforeEach(() => {
  vi.clearAllMocks()
  create.mockImplementation(async ({ data }) => ({ id: 42, ...data }))
  findGlobal.mockResolvedValue({
    recipient: 'bureau@example.net',
    sender: 'contact@randonnees-touloises.net',
  })
})

describe('emailing a contact message', () => {
  it('sends it to the recipient set in the admin, answerable to the visitor', async () => {
    expect(await submit()).toEqual({ success: true })

    expect(sendEmail).toHaveBeenCalledOnce()
    const message = sendEmail.mock.calls[0][0]
    expect(message).toMatchObject({
      from: '"Jeanne Dupont via le site" <contact@randonnees-touloises.net>',
      replyTo: 'jeanne@example.net',
      subject: 'Nouveau message de Jeanne Dupont',
      to: 'bureau@example.net',
    })
    expect(message.text).toContain('Puis-je venir à la sortie de dimanche ?')
    expect(message.text).toContain('06 12 34 56 78')
    expect(message.text).toContain('/admin/collections/contactSubmissions/42')
  })

  /* Unquoted, a comma would split the name into a second sender. */
  it('keeps a name with a comma, quote or line break to one display name', async () => {
    await submit({ nom: 'Dupont, Jeanne "JD"\nBis' })

    expect(sendEmail.mock.calls[0][0]).toMatchObject({
      from: '"Dupont, Jeanne \\"JD\\" Bis via le site" <contact@randonnees-touloises.net>',
      subject: 'Nouveau message de Dupont, Jeanne "JD" Bis',
    })
  })

  it('sends nothing while no recipient is set', async () => {
    findGlobal.mockResolvedValue({ recipient: null, sender: 'contact@randonnees-touloises.net' })

    expect(await submit()).toEqual({ success: true })
    expect(create).toHaveBeenCalledOnce()
    expect(sendEmail).not.toHaveBeenCalled()
  })

  /* The message is saved by then; a mail outage must not tell the visitor it failed. */
  it('still reports success when sending fails', async () => {
    sendEmail.mockRejectedValue(new Error('SES unreachable'))

    expect(await submit()).toEqual({ success: true })
    expect(logError).toHaveBeenCalledOnce()
  })

  it('sends nothing for a message it refused to store', async () => {
    expect(await submit({ email: 'not-an-email' })).toEqual({ error: 'invalid', success: false })
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
