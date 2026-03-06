'use client'

import { useTransition } from 'react'
import { updateOrderStatusAction } from '@/actions/admin'
import type { AdminOrder } from '@/lib/schemas/admin'

export function StatusActions({ orderId, status }: { orderId: string; status: AdminOrder['status'] }) {
  const [pending, startTransition] = useTransition()

  if (status === 'Refunded') return null

  const next = status === 'Unpaid' ? 'Paid' : 'Refunded'
  const label = status === 'Unpaid' ? 'Mark as Paid' : 'Mark as Refunded'
  const colour = status === 'Unpaid'
    ? 'bg-gray-900 hover:bg-gray-700 text-white'
    : 'bg-red-600 hover:bg-red-700 text-white'

  return (
    <button
      disabled={pending}
      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${colour}`}
      onClick={() => startTransition(() => updateOrderStatusAction(orderId, next))}
    >
      {pending ? '…' : label}
    </button>
  )
}
