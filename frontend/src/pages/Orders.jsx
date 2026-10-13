import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import OrderCard from '../components/OrderCard'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/orders')
      setOrders(res.data.orders)
    } catch {
      setError('Unable to load your orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900">My Orders</h1>

        {loading && <p className="text-neutral-500">Loading your orders...</p>}

        {!loading && error && (
          <div className="flex flex-col items-center gap-4 rounded-2xl bg-red-50 px-4 py-8 text-center">
            <p className="text-red-700">Unable to load your orders.</p>
            <button
              onClick={fetchOrders}
              className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <h2 className="text-lg font-semibold text-neutral-900">You have not placed any orders yet.</h2>
            <Link
              to="/products"
              className="mt-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders
