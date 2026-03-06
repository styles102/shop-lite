import { z } from 'zod'
import { ProductSchema } from './product'

export const BasketItemSchema = z.object({
  id: z.string().uuid(),
  basketId: z.string().uuid(),
  productSku: z.string().uuid(),
  product: ProductSchema,
  quantity: z.number().int(),
})

export const BasketSchema = z.object({
  id: z.string().uuid(),
  items: z.array(BasketItemSchema),
})

export type BasketItem = z.infer<typeof BasketItemSchema>
export type Basket = z.infer<typeof BasketSchema>
