'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { createOrder } from '@/lib/api/orders'
import { CreateOrderSchema, type Address } from '@/lib/schemas/order'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function AddressFields({ prefix, label }: { prefix: 'billingAddress' | 'deliveryAddress'; label: string }) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-medium">{label}</legend>
      <div className="grid grid-cols-1 gap-3">
        {(['line1', 'line2', 'city', 'postcode', 'country'] as const).map(field => (
          <div key={field}>
            <Label htmlFor={`${prefix}.${field}`} className="capitalize text-sm">
              {field === 'line1' ? 'Address line 1' : field === 'line2' ? 'Address line 2 (optional)' : field}
            </Label>
            <Input id={`${prefix}.${field}`} name={`${prefix}.${field}`} className="mt-1" />
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export default function OrderPage({ basketId }: { basketId: string | undefined}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    if (!basketId) {
      setError('No basket found. Please add items before checking out.')
      setSubmitting(false)
      return
    }

    const formData = new FormData(e.currentTarget)

    const raw = {
      customerEmail: formData.get('customerEmail') as string,
      billingAddress: {
        line1: formData.get('billingAddress.line1') as string,
        line2: (formData.get('billingAddress.line2') as string) || null,
        city: formData.get('billingAddress.city') as string,
        postcode: formData.get('billingAddress.postcode') as string,
        country: formData.get('billingAddress.country') as string,
      } satisfies Address,
      deliveryAddress: {
        line1: formData.get('deliveryAddress.line1') as string,
        line2: (formData.get('deliveryAddress.line2') as string) || null,
        city: formData.get('deliveryAddress.city') as string,
        postcode: formData.get('deliveryAddress.postcode') as string,
        country: formData.get('deliveryAddress.country') as string,
      } satisfies Address,
    }

    const result = CreateOrderSchema.safeParse(raw)
    if (!result.success) {
      const messages = result.error.issues.map(issue => issue.message).join(', ')
      setError(messages)
      setSubmitting(false)
      return
    }

    try {
			console.log(basketId);
      const orderId = await createOrder(basketId, result.data)
      // Clear basket cookie
      document.cookie = 'basketId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push(`/order/${orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order.')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
			{basketId}
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="customerEmail">Email address</Label>
          <Input id="customerEmail" name="customerEmail" type="email" className="mt-1" required />
        </div>
        <Separator />
        <AddressFields prefix="billingAddress" label="Billing address" />
        <Separator />
        <AddressFields prefix="deliveryAddress" label="Delivery address" />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? 'Placing order…' : 'Place order'}
        </Button>
      </form>
    </div>
  )
}
