import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useCart } from '../context/CartContext'

function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cartStatus, setCartStatus] = useState('idle')
  const { addToCart } = useCart()

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data.product)
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Product not found.'
            : 'Something went wrong while loading this product.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  async function handleAddToCart() {
    if (cartStatus === 'adding') return

    setCartStatus('adding')
    try {
      await addToCart(product._id)
      setCartStatus('idle')
    } catch {
      setCartStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/products"
          className="mb-4 inline-block rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
        >
          ← Back to Products
        </Link>

        {loading && <p className="mt-4 text-neutral-500">Loading product...</p>}

        {!loading && error && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
        )}

        {!loading && !error && product && (
          <div className="mt-4 grid grid-cols-1 gap-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:grid-cols-2">
            <div className="flex items-center justify-center rounded-2xl bg-neutral-100 p-6">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-80 w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-3">
              <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                {product.category}
              </span>
              <h1 className="text-2xl font-bold text-neutral-900">{product.name}</h1>
              <p className="text-neutral-600">{product.description}</p>
              <span className="text-2xl font-bold text-neutral-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className={product.stock > 0 ? 'text-sm text-green-600' : 'text-sm text-red-600'}>
                {product.stock > 0 ? `${product.stock} units left` : 'Out of stock'}
              </span>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || cartStatus === 'adding'}
                className="mt-3 w-full rounded-full bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-black disabled:opacity-60"
              >
                {cartStatus === 'adding' ? 'Adding...' : 'Add to Cart'}
              </button>

              {cartStatus === 'error' && (
                <span className="text-xs text-red-600">
                  Unable to add to cart. Please try again.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetails
