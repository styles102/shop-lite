import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminOrders } from '@/lib/api/admin'
import { Badge } from '@/components/ui/badge'
import type { AdminOrder } from '@/lib/schemas/admin'

function StatusBadge({ status }: { status: AdminOrder['status'] }) {
  return (
    <Badge variant={status === 'Paid' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  )
}

function DeliveryBadge({ status }: { status: AdminOrder['deliveryStatus'] }) {
  const variant =
    status === 'Delivered' ? 'default' :
    status === 'Despatched' ? 'secondary' : 'outline'
  return <Badge variant={variant}>{status}</Badge>
}

export default async function DashboardPage() {
  const jar = await cookies()
  const token = jar.get('adminToken')?.value
  if (!token) redirect('/admin/login')

  let orders: AdminOrder[] = []
  try {
    orders = await getAdminOrders(token)
  } catch {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Recent orders</h1>
        <p className="text-sm text-gray-500 mt-1">Latest {orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Order</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Total</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Payment</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Delivery</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">{order.customerEmail}</td>
                  <td className="px-4 py-3 font-medium">£{order.orderTotal.toFixed(2)}</td>
                  <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                  <td className="px-4 py-3"><DeliveryBadge status={order.deliveryStatus} /></td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
