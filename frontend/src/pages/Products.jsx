import { useEffect, useState } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import SearchBar from '../components/SearchBar'
import ProductCard from '../components/ProductCard'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [wishlistIds, setWishlistIds] = useState(new Set())

  useEffect(() => {
    async function fetchWishlistIds() {
      try {
        const res = await api.get('/wishlist')
        setWishlistIds(new Set(res.data.wishlist.map((p) => p._id)))
      } catch {
       }
    }

    fetchWishlistIds()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const controller = new AbortController()

      async function fetchProducts() {
        setLoading(true)
        setError('')
        try {
          const res = await api.get('/products', {
            params: { search: search || undefined, category: category || undefined },
            signal: controller.signal,
          })
          setProducts(res.data.products)
        } catch (err) {
          if (err.name !== 'CanceledError') {
            setError('Something went wrong while loading products.')
          }
        } finally {
          setLoading(false)
        }
      }

      fetchProducts()
      return () => controller.abort()
    }, 350)

    return () => clearTimeout(timeoutId)
  }, [search, category])

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-1 text-3xl font-bold tracking-tight text-neutral-900">Products</h1>
        <p className="mb-6 text-neutral-500">Give all you need.</p>

        <div className="mb-6">
          <SearchBar
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
        </div>

        {loading && <p className="text-neutral-500">Loading products...</p>}

        {!loading && error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="text-neutral-500">No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialSaved={wishlistIds.has(product._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products
