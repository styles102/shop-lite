import { AdminOrderSchema, type AdminOrder } from '@/lib/schemas/admin';
import { z } from 'zod';

const base = process.env['services__server__https__0'] ?? process.env['services__server__http__0'] ?? ''

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${base}/api/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  console.log(res);
  if (!res.ok) throw new Error('Invalid credentials')
  const data = await res.json()
  return data.token as string
}

export async function getAdminOrders(token: string): Promise<AdminOrder[]> {
  const res = await fetch(`${base}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch orders')
  return z.array(AdminOrderSchema).parse(await res.json())
}

export async function updateOrderStatus(
  id: string,
  status: 'Paid' | 'Refunded',
  token: string
): Promise<void> {
  const res = await fetch(`${base}/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  })
  console.log(res);
  if (!res.ok) throw new Error(`Failed to update order status: ${res.status}`)
}
