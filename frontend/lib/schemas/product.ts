import { z } from 'zod'

export const ProductSchema = z.object({
  sku: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  stock: z.number().int(),
  price: z.number(),
  salePrice: z.number().nullable(),
})

export type Product = z.infer<typeof ProductSchema>
