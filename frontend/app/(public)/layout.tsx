import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getBasket } from '@/lib/api/baskets'
import { Badge } from '@/components/ui/badge'
import '@/app/globals.css'

export const metadata: Metadata = { title: 'Shop Lite' }

async function BasketCount() {
  const jar = await cookies()
  const basketId = jar.get('basketId')?.value
  if (!basketId) return null
  try {
    const basket = await getBasket(basketId)
    const count = basket.items.reduce((sum, i) => sum + i.quantity, 0)
    if (count === 0) return null
    return <Badge variant="secondary">{count}</Badge>
  } catch {
    return null
  }
}

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-muted/30 text-foreground antialiased">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/products" className="font-semibold text-lg tracking-tight">
              Shop Lite
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/products" className="font-medium transition-colors hover:text-foreground/80">Products</Link>
              <Link href="/basket" className="flex items-center gap-1.5 font-medium transition-colors hover:text-foreground/80">
                Basket
                <BasketCount />
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
      </body>
    </html>
  )
}
