import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CartItem from '../components/CartItem'
import { useCart } from '../context/CartContext'

function Cart() {
  const { cartItems, loading, error, itemCount, subtotal, refreshCart } = useCart()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Cart</h1>

        {loading && <p className="mt-6 text-neutral-500">Loading your cart...</p>}

        {!loading && error && (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl bg-red-50 px-4 py-8 text-center">
            <p className="text-red-700">Unable to load your cart.</p>
            <button
              onClick={refreshCart}
              className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="mt-6 flex flex-col items-center gap-3 py-12 text-center">
            <span className="text-4xl">🛒</span>
            <h2 className="text-lg font-semibold text-neutral-900">Your cart is empty</h2>
            <p className="text-neutral-500">Looks like you haven&apos;t added anything yet.</p>
            <Link
              to="/products"
              className="mt-2 rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black"
            >
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-neutral-900">Order Summary</h2>
              <div className="mt-4 flex items-center justify-between text-neutral-600">
                <span>Items</span>
                <span>{itemCount}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-lg font-bold text-neutral-900">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="mt-6 w-full rounded-full bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-black"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart
