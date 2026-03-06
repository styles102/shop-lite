import { ProductSchema, type Product } from '@/lib/schemas/product';
import { z } from 'zod';

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${process.env.API_BASE_URI}/api/products`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch products')
  return z.array(ProductSchema).parse(await res.json())
}

export async function getProduct(sku: string): Promise<Product> {
  const res = await fetch(`${process.env.API_BASE_URI}/api/products/${sku}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch product')
  return ProductSchema.parse(await res.json())
}
