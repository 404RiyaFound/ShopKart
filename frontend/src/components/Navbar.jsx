import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

function Navbar() {
  const navigate = useNavigate()
  const [wishlistCount, setWishlistCount] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const { itemCount } = useCart()

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await api.get('/wishlist')
        setWishlistCount(res.data.count)
      } catch {
        setWishlistCount(null)
      }
    }

    async function fetchCurrentUser() {
      try {
        const res = await api.get('/customers/me')
        setIsAdmin(Boolean(res.data.isAdmin))
      } catch {
        setIsAdmin(false)
      }
    }

    fetchCount()
    fetchCurrentUser()
  }, [])

  async function handleLogout() {
    try {
      await api.post('/customers/logout')
    } finally {
      navigate('/login')
    }
  }

  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <Link to="/home" className="text-xl font-bold tracking-tight text-neutral-900">
        ShopKart
      </Link>
      <div className="flex items-center gap-6">
        <Link
          to="/products"
          className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
        >
          Products
        </Link>
        <Link
          to="/wishlist"
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
        >
          Wishlist
          {wishlistCount !== null && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
              {wishlistCount}
            </span>
          )}
        </Link>
        <Link
          to="/cart"
          className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
        >
          Cart ({itemCount})
        </Link>
        <Link
          to="/orders"
          className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
        >
          Orders
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            Admin
          </Link>
        )}
        <button
          onClick={handleLogout}
          className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
