import Link from 'next/link'
import { getOrder } from '@/lib/api/orders'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Address } from '@/lib/schemas/order'

function AddressBlock({ address, label }: { address: Address; label: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-sm">{address.line1}</p>
      {address.line2 && <p className="text-sm">{address.line2}</p>}
      <p className="text-sm">{address.city}, {address.postcode}</p>
      <p className="text-sm">{address.country}</p>
    </div>
  )
}

const statusColour: Record<string, string> = {
  Unpaid: 'destructive',
  Paid: 'default',
}

const deliveryColour: Record<string, string> = {
  Processing: 'secondary',
  Despatched: 'default',
  Delivered: 'default',
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(id)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Order confirmed</h1>
        <p className="text-sm text-muted-foreground mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="flex gap-3 mb-6">
        <Badge variant={statusColour[order.status] as 'destructive' | 'default' | 'secondary' | 'outline'}>
          {order.status}
        </Badge>
        <Badge variant={deliveryColour[order.deliveryStatus] as 'destructive' | 'default' | 'secondary' | 'outline'}>
          {order.deliveryStatus}
        </Badge>
      </div>

      <div className="space-y-3 mb-6">
        {order.items.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.productName} × {item.quantity}</span>
            <span>£{(item.unitPrice * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>£{order.orderTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
        <AddressBlock address={order.billingAddress} label="Billing address" />
        <AddressBlock address={order.deliveryAddress} label="Delivery address" />
      </div>

      <Button asChild variant="outline">
        <Link href="/products">Continue shopping</Link>
      </Button>
    </div>
  )
}
