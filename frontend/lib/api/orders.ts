import { OrderSchema, type Address, type CreateOrderInput, type Order } from '@/lib/schemas/order'

const base = process.env['services__server__https__0'] ?? process.env['services__server__http__0'] ?? ''

export async function createOrder(basketId: string, input: CreateOrderInput): Promise<string> {
  const res = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ basketId, ...input }),
  })
  if (!res.ok) throw new Error('Failed to create order')
  const data = await res.json()
  return data.id as string
}

export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${base}/api/orders/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch order')
  return OrderSchema.parse(await res.json())
}

export async function updateDeliveryAddress(id: string, deliveryAddress: Address): Promise<void> {
  const res = await fetch(`${base}/api/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliveryAddress }),
  })
  if (!res.ok) throw new Error('Failed to update delivery address')
}