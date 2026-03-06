const base = process.env['services__server__https__0'] ?? process.env['services__server__http__0'] ?? ''

import { BasketSchema, type Basket } from '@/lib/schemas/basket'

export async function createBasket(): Promise<string> {
  const res = await fetch(`${base}/api/baskets`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to create basket')
  const data = await res.json()
  return data.id as string
}

export async function getBasket(id: string): Promise<Basket> {
  const res = await fetch(`${base}/api/baskets/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch basket')
  return BasketSchema.parse(await res.json())
}

export async function upsertItem(basketId: string, productSku: string, quantity: number): Promise<void> {
  const res = await fetch(`${base}/api/baskets/${basketId}/items/${productSku}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })
  console.log(res);
  if (!res.ok) throw new Error('Failed to update basket item')
}

export async function deleteBasket(id: string): Promise<void> {
  const res = await fetch(`${base}/api/baskets/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete basket')
}
