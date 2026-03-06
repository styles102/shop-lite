'use server'

import { adminLogin, updateOrderStatus } from '@/lib/api/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(
  email: string,
  password: string
): Promise<{ error?: string }> {
  try {
    const token = await adminLogin(email, password)
    const jar = await cookies()
    jar.set('adminToken', token, {
      path: '/admin',
      httpOnly: true,
      sameSite: 'lax',
    })
  } catch(err) {
    console.error(err);
    return { error: 'Invalid email or password' }
  }
  redirect('/admin/dashboard')
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies()
  jar.delete('adminToken')
  redirect('/admin/login')
}

export async function updateOrderStatusAction(
  orderId: string,
  status: 'Paid' | 'Refunded'
): Promise<void> {
  const jar = await cookies()
  const token = jar.get('adminToken')?.value
  if (!token) redirect('/admin/login')
  await updateOrderStatus(orderId, status, token)
  revalidatePath('/admin/dashboard')
}
