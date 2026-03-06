import Link from 'next/link'
import { cookies } from 'next/headers'
import { getBasket } from '@/lib/api/baskets'
import { removeFromBasket } from '@/actions/basket'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default async function BasketPage() {
  const jar = await cookies()
  const basketId = jar.get('basketId')?.value

  if (!basketId) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Your basket is empty.</p>
        <Button asChild variant="outline"><Link href="/products">Browse products</Link></Button>
      </div>
    )
  }

  let basket
  try {
    basket = await getBasket(basketId)
  } catch {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Could not load basket.
      </div>
    )
  }

  if (basket.items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">Your basket is empty.</p>
        <Button asChild variant="outline"><Link href="/products">Browse products</Link></Button>
      </div>
    )
  }

  const total = basket.items.reduce(
    (sum, item) => sum + (item.product.salePrice ?? item.product.price) * item.quantity,
    0
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Your Basket</h1>
      <div className="space-y-4">
        {basket.items.map(item => {
          const unitPrice = item.product.salePrice ?? item.product.price
          return (
            <div key={item.id}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    £{unitPrice.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold whitespace-nowrap">
                  £{(unitPrice * item.quantity).toFixed(2)}
                </p>
                <form
                  action={async () => {
                    'use server'
                    await removeFromBasket(item.productSku)
                  }}
                >
                  <Button variant="ghost" size="sm" type="submit">Remove</Button>
                </form>
              </div>
              <Separator className="mt-4" />
            </div>
          )
        })}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-xl font-bold">£{total.toFixed(2)}</p>
        </div>
        <Button asChild size="lg">
          <Link href="/order">Proceed to checkout</Link>
        </Button>
      </div>
    </div>
  )
}
