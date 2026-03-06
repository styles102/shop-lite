import { z } from 'zod'

export const AddressSchema = z.object({
  line1: z.string().min(1, 'Required'),
  line2: z.string().nullable().optional(),
  city: z.string().min(1, 'Required'),
  postcode: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
})

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  productSku: z.string().uuid(),
  productName: z.string(),
  unitPrice: z.number(),
  quantity: z.number().int(),
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  customerEmail: z.string().email(),
  billingAddress: AddressSchema,
  deliveryAddress: AddressSchema,
  orderTotal: z.number(),
  status: z.enum(['Unpaid', 'Paid']),
  deliveryStatus: z.enum(['Processing', 'Despatched', 'Delivered']),
  items: z.array(OrderItemSchema),
})

export const CreateOrderSchema = z.object({
  customerEmail: z.string().email('Valid email required'),
  billingAddress: AddressSchema,
  deliveryAddress: AddressSchema,
})

export type Address = z.infer<typeof AddressSchema>
export type Order = z.infer<typeof OrderSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
