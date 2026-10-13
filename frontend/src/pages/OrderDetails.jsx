import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { getStatusStyle } from '../utils/orderStatus'

function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/orders/${id}`)
        setOrder(res.data.order)
      } catch (err) {
        setError(err.response?.status === 404 ? 'Order not found.' : 'Unable to load this order.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          to="/orders"
          className="mb-4 inline-block rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          ← Back to Orders
        </Link>

        {loading && <p className="mt-4 text-neutral-500">Loading order...</p>}

        {!loading && error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
        )}

        {!loading && !error && order && (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-neutral-900">Order #{order._id.slice(-8)}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {order.items.map((item) => (
                <div
                  key={item.product}
                  className="flex items-center justify-between border-b border-neutral-100 pb-3"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-lg bg-neutral-100 object-contain p-1"
                      />
                    )}
                    <div>
                      <p className="font-medium text-neutral-900">{item.name}</p>
                      <p className="text-sm text-neutral-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-neutral-900">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-lg font-bold text-neutral-900">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="mt-6 rounded-2xl bg-neutral-50 p-4 text-sm text-neutral-600">
              <h2 className="mb-2 font-medium text-neutral-900">Shipping Address</h2>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
