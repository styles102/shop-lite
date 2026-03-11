import { addToBasket } from '@/actions/basket'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getProducts } from '@/lib/api/products'
import type { Product } from '@/lib/schemas/product'
import Image from 'next/image'

function ProductCard({ product }: { product: Product }) {
  const effectivePrice = product.salePrice ?? product.price

  return (
    <Card className="flex h-full flex-col overflow-hidden border-border/70 pt-0 transition-shadow hover:shadow-md">
      {product.imageUrl && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{product.name}</CardTitle>
          {product.stock === 0 && <Badge variant="destructive">Out of stock</Badge>}
          {product.stock > 0 && product.stock <= 5 && (
            <Badge variant="secondary">Only {product.stock} left</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-semibold tracking-tight">£{effectivePrice.toFixed(2)}</span>
          {product.salePrice !== null && (
            <span className="text-sm text-muted-foreground line-through">
              £{product.price.toFixed(2)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <form
          action={async () => {
            'use server'
            await addToBasket(product.sku, 1)
          }}
          className="w-full"
        >
          <Button type="submit" className="w-full" disabled={product.stock === 0}>
            Add to basket
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default async function ProductsPage() {
  const products = await getProducts()

  if (products.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No products available yet.
      </div>
    )
  }

  return (
    <section>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-2 text-sm text-muted-foreground">Find items currently available in store.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>
    </section>
  )
}
