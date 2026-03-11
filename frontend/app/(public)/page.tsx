import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  const hasBasket = Boolean(cookieStore.get('basketId')?.value)

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 text-card-foreground shadow-sm sm:p-10">
      <p className="mb-3 inline-flex rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
        Everyday essentials, simple checkout
      </p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Welcome to Shop Lite</h1>
      <p className="mt-4 text-muted-foreground">
        Browse our curated products, add what you need, and place your order in minutes.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/products">Browse products</Link>
        </Button>
        {hasBasket && (
          <Button asChild size="lg" variant="outline">
            <Link href="/basket">View basket</Link>
          </Button>
        )}
      </div>
    </section>
  )
}
