import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { getStatusStyle, getNextStatus } from '../utils/orderStatus'

const initialProductForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  stock: '',
}

function Admin() {
  const navigate = useNavigate()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [allowed, setAllowed] = useState(false)

  const [productForm, setProductForm] = useState(initialProductForm)
  const [productError, setProductError] = useState('')
  const [productSuccess, setProductSuccess] = useState('')
  const [creatingProduct, setCreatingProduct] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')
  const [updatingOrderId, setUpdatingOrderId] = useState(null)

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await api.get('/customers/me')
        if (!res.data.isAdmin) {
          navigate('/home')
          return
        }
        setAllowed(true)
      } catch {
        navigate('/login')
      } finally {
        setCheckingAccess(false)
      }
    }

    checkAccess()
  }, [navigate])

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true)
    setOrdersError('')
    try {
      const res = await api.get('/orders/admin/all')
      setOrders(res.data.orders)
    } catch {
      setOrdersError('Unable to load orders.')
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  useEffect(() => {
    if (allowed) {
      fetchOrders()
    }
  }, [allowed, fetchOrders])

  function handleProductChange(e) {
    setProductForm({ ...productForm, [e.target.name]: e.target.value })
  }

  async function handleCreateProduct(e) {
    e.preventDefault()
    setProductError('')
    setProductSuccess('')

    const { name, description, category, image, price, stock } = productForm

    if (!name.trim() || !description.trim() || !category.trim() || !image.trim() || !price || !stock) {
      setProductError('All fields are required')
      return
    }

    setCreatingProduct(true)
    try {
      await api.post('/products', {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        image: image.trim(),
        price: Number(price),
        stock: Number(stock),
      })
      setProductSuccess('Product created successfully')
      setProductForm(initialProductForm)
    } catch (err) {
      setProductError(err.response?.data?.message || 'Unable to create product')
    } finally {
      setCreatingProduct(false)
    }
  }

  async function handleAdvanceStatus(order) {
    const nextStatus = getNextStatus(order.status)
    if (!nextStatus) return

    setUpdatingOrderId(order._id)
    try {
      const res = await api.patch(`/orders/${order._id}/status`, { status: nextStatus })
      setOrders((prev) => prev.map((o) => (o._id === order._id ? res.data.order : o)))
    } catch {
      setOrdersError('Unable to update that order. Please try again.')
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (checkingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-500">
        Checking access...
      </div>
    )
  }

  if (!allowed) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900">Admin</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Create Product</h2>

            {productError && (
              <div className="mb-4 rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">
                {productError}
              </div>
            )}
            {productSuccess && (
              <div className="mb-4 rounded-2xl bg-green-50 px-4 py-2 text-sm text-green-700">
                {productSuccess}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Product name"
                value={productForm.name}
                onChange={handleProductChange}
                className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <textarea
                name="description"
                placeholder="Description"
                value={productForm.description}
                onChange={handleProductChange}
                rows={3}
                className="w-full rounded-2xl border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={productForm.category}
                onChange={handleProductChange}
                className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <input
                type="text"
                name="image"
                placeholder="Image URL"
                value={productForm.image}
                onChange={handleProductChange}
                className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  min="0.01"
                  step="0.01"
                  value={productForm.price}
                  onChange={handleProductChange}
                  className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  min="0"
                  value={productForm.stock}
                  onChange={handleProductChange}
                  className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <button
                type="submit"
                disabled={creatingProduct}
                className="w-full rounded-full bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-black disabled:opacity-60"
              >
                {creatingProduct ? 'Creating...' : 'Create Product'}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Manage Orders</h2>

            {ordersLoading && <p className="text-neutral-500">Loading orders...</p>}
            {!ordersLoading && ordersError && <p className="text-red-600">{ordersError}</p>}
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <p className="text-neutral-500">No orders yet.</p>
            )}

            {!ordersLoading && orders.length > 0 && (
              <div className="flex flex-col gap-3">
                {orders.map((order) => {
                  const nextStatus = getNextStatus(order.status)
                  return (
                    <div key={order._id} className="rounded-2xl border border-neutral-100 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-neutral-900">
                          #{order._id.slice(-8)}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-neutral-500">
                        {order.user?.fullName} ({order.user?.email})
                      </p>
                      <p className="mt-1 text-sm font-medium text-neutral-900">
                        ₹{order.totalAmount.toLocaleString('en-IN')}
                      </p>

                      {order.status !== 'PENDING_PAYMENT' && nextStatus && (
                        <button
                          onClick={() => handleAdvanceStatus(order)}
                          disabled={updatingOrderId === order._id}
                          className="mt-3 rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-black disabled:opacity-60"
                        >
                          {updatingOrderId === order._id ? 'Updating...' : `Mark as ${nextStatus}`}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
