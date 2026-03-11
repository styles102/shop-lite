import Link from 'next/link'
import { cookies } from 'next/headers'
import { getBasket } from '@/lib/api/baskets'
import { removeFromBasket } from '@/actions/basket'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <section className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your Basket</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {basket.items.map(item => {
            const unitPrice = item.product.salePrice ?? item.product.price
            return (
              <div key={item.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      £{unitPrice.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-semibold">
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
        </CardContent>
      </Card>
      <div className="mt-6 flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm">
        <div>
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold tracking-tight">£{total.toFixed(2)}</p>
        </div>
        <Button asChild size="lg">
          <Link href="/order">Proceed to checkout</Link>
        </Button>
      </div>
    </section>
  )
}
