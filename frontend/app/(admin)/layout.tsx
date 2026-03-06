import type { Metadata } from 'next'
import { logoutAction } from '@/actions/admin'
import '@/app/globals.css'

export const metadata: Metadata = { title: 'Shop Lite Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-gray-900 text-white">
          <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
            <span className="font-semibold text-lg tracking-tight">Shop Lite Admin</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Log out
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
