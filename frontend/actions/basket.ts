'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createBasket, upsertItem } from '@/lib/api/baskets'

export async function getOrCreateBasketId(): Promise<string> {
  const jar = await cookies()
  let id = jar.get('basketId')?.value
  if (!id) {
    id = await createBasket()
    jar.set('basketId', id, { path: '/', httpOnly: true, sameSite: 'lax' })
  }
  return id
}

export async function addToBasket(productSku: string, quantity: number) {
  const basketId = await getOrCreateBasketId()
  await upsertItem(basketId, productSku, quantity)
  revalidatePath('/basket')
}

export async function removeFromBasket(productSku: string) {
  const jar = await cookies()
  const basketId = jar.get('basketId')?.value
  if (basketId) {
    await upsertItem(basketId, productSku, 0)
    revalidatePath('/basket')
  }
}
