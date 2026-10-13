import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import WishlistCard from '../components/WishlistCard'

function Wishlist() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchWishlist = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/wishlist')
      setWishlist(res.data.wishlist)
    } catch {
      setError('Unable to load wishlist.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  async function handleRemove(productId) {
    try {
      await api.delete(`/wishlist/${productId}`)
      setWishlist((prev) => prev.filter((p) => p._id !== productId))
    } catch {
      setError('Unable to remove product. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Wishlist</h1>
        {!loading && !error && (
          <p className="mb-6 text-neutral-500">{wishlist.length} products saved</p>
        )}

        {loading && <p className="mt-6 text-neutral-500">Loading your wishlist...</p>}

        {!loading && error && (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-red-50 px-4 py-8 text-center">
            <p className="text-red-700">
              Something went wrong.
              <br />
              We couldn&apos;t load your wishlist.
            </p>
            <button
              onClick={fetchWishlist}
              className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">❤️</span>
            <h2 className="text-lg font-semibold text-neutral-900">Your wishlist is empty</h2>
            <p className="text-neutral-500">
              Save products you love and find them here later.
            </p>
            <Link
              to="/products"
              className="mt-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((product) => (
              <WishlistCard key={product._id} product={product} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
