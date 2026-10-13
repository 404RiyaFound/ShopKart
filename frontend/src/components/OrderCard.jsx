import { Link } from 'react-router-dom'
import { getStatusStyle } from '../utils/orderStatus'

function OrderCard({ order }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-neutral-900">Order #{order._id.slice(-8)}</span>
        <span className="text-sm text-neutral-500">
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-1 text-sm text-neutral-600">
        {order.items.map((item) => (
          <span key={item.product}>
            {item.name} × {item.quantity}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-neutral-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(order.status)}`}>
          {order.status}
        </span>
      </div>

      <Link
        to={`/orders/${order._id}`}
        className="mt-4 block rounded-full border border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
      >
        View Details
      </Link>
    </div>
  )
}

export default OrderCard
