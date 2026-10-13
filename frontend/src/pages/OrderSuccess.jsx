import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

function OrderSuccess() {
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
      } catch {
        setError('Unable to load order details.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        {loading && <p className="text-neutral-500">Loading...</p>}

        {!loading && error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
        )}

        {!loading && !error && order && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8">
            <span className="text-4xl">✅</span>
            <h1 className="mt-4 text-2xl font-bold text-neutral-900">Order Placed Successfully</h1>

            <div className="mt-6 space-y-2 text-left text-neutral-600">
              <p>
                <span className="font-medium text-neutral-900">Order ID:</span> {order._id}
              </p>
              <p>
                <span className="font-medium text-neutral-900">Total:</span>{' '}
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </p>
              <p>
                <span className="font-medium text-neutral-900">Status:</span> {order.status}
              </p>
            </div>

            <p className="mt-6 text-sm text-neutral-500">Your order has been saved successfully.</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/orders"
                className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
              >
                View My Orders
              </Link>
              <Link
                to="/products"
                className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderSuccess
