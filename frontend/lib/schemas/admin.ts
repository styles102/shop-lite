import { z } from 'zod'
import { OrderItemSchema } from './order'

export const AdminOrderSchema = z.object({
  id: z.uuid(),
  customerEmail: z.string().email(),
  orderTotal: z.number(),
  status: z.enum(['Unpaid', 'Paid', 'Refunded']),
  deliveryStatus: z.enum(['Processing', 'Despatched', 'Delivered']),
  createdAt: z.string().datetime({ offset: true }),
  items: z.array(OrderItemSchema),
})

export type AdminOrder = z.infer<typeof AdminOrderSchema>
