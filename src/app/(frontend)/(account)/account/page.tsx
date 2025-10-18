import type { Metadata } from 'next'

import { Button } from '@/components/ui/button'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { AccountForm } from '@/components/account/AccountForm'

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent('Please login to access your account settings.')}`,
    )
  }

  return (
    <>
      <div className="border p-8 rounded-lg bg-primary-foreground">
        <h1 className="text-3xl font-medium mb-8">Account settings</h1>
        <AccountForm />
      </div>

      <div className=" border p-8 rounded-lg bg-primary-foreground">
        <h2 className="text-3xl font-medium mb-8">Recent Orders</h2>

        <div className="prose dark:prose-invert mb-8">
          <p>
            These are the most recent orders you have placed. Each order is associated with an
            payment. As you place more orders, they will appear in your orders list.
          </p>
        </div>

        <Button asChild variant="default">
          <Link href="/orders">View all orders</Link>
        </Button>
      </div>
    </>
  )
}

export const metadata: Metadata = {
  description: 'Create an account or log in to your existing account.',
  openGraph: mergeOpenGraph({
    title: 'Account',
    url: '/account',
  }),
  title: 'Account',
}
