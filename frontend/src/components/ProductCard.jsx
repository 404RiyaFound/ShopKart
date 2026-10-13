import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

function ProductCard({ product, initialSaved = false }) {
  const inStock = product.stock > 0
  const [saved, setSaved] = useState(initialSaved)
  const [wishlistStatus, setWishlistStatus] = useState('idle')
  const [cartStatus, setCartStatus] = useState('idle')
  const { addToCart } = useCart()

  async function handleToggleWishlist() {
    if (wishlistStatus === 'saving') return

    setWishlistStatus('saving')
    try {
      const res = await api.patch(`/wishlist/${product._id}/toggle`)
      setSaved(res.data.saved)
      setWishlistStatus('idle')
    } catch {
      setWishlistStatus('error')
    }
  }

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

  const wishlistLabel =
    wishlistStatus === 'saving' ? '⏳ Saving...' : saved ? '♥ Remove' : '♡ Wishlist'
  const cartLabel = cartStatus === 'adding' ? 'Adding...' : 'Add to Cart'

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="relative bg-neutral-100 p-4">
        <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm">
          {product.category}
        </span>
        <img
          src={product.image}
          alt={product.name}
          className="h-44 w-full object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-neutral-900">{product.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-bold text-neutral-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className={`text-xs font-medium ${inStock ? 'text-green-600' : 'text-red-600'}`}>
            {inStock ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || cartStatus === 'adding'}
          className="mt-3 w-full rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
        >
          {cartLabel}
        </button>

        <div className="mt-2 flex gap-2">
          <Link
            to={`/products/${product._id}`}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            View Details
          </Link>

          <button
            onClick={handleToggleWishlist}
            disabled={wishlistStatus === 'saving'}
            className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-60"
          >
            {wishlistLabel}
          </button>
        </div>

        {wishlistStatus === 'error' && (
          <span className="mt-1 text-xs text-red-600">
            Unable to save product. Please try again.
          </span>
        )}
        {cartStatus === 'error' && (
          <span className="mt-1 text-xs text-red-600">
            Unable to add to cart. Please try again.
          </span>
        )}
      </div>
    </div>
  )
}

export default ProductCard
