import { useState } from 'react'
import { useCart } from '../context/CartContext'

function CartItem({ item }) {
  const { product, quantity } = item
  const { updateQuantity, removeFromCart } = useCart()
  const [busy, setBusy] = useState(false)

  async function handleChangeQuantity(nextQuantity) {
    if (busy || nextQuantity < 1 || nextQuantity > product.stock) return

    setBusy(true)
    try {
      await updateQuantity(product._id, nextQuantity)
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    setBusy(true)
    try {
      await removeFromCart(product._id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center">
      <div className="flex items-center justify-center rounded-2xl bg-neutral-100 p-3 sm:h-24 sm:w-24">
        <img src={product.image} alt={product.name} className="h-16 w-16 object-contain" />
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-neutral-900">{product.name}</h3>
        <p className="text-sm text-neutral-500">₹{product.price.toLocaleString('en-IN')}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => handleChangeQuantity(quantity - 1)}
          disabled={busy || quantity <= 1}
          className="h-8 w-8 rounded-full border border-neutral-300 text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-6 text-center font-medium text-neutral-900">{quantity}</span>
        <button
          onClick={() => handleChangeQuantity(quantity + 1)}
          disabled={busy || quantity >= product.stock}
          className="h-8 w-8 rounded-full border border-neutral-300 text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-40"
        >
          +
        </button>
      </div>

      <div className="w-24 text-right font-semibold text-neutral-900">
        ₹{(product.price * quantity).toLocaleString('en-IN')}
      </div>

      <button
        onClick={handleRemove}
        disabled={busy}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
      >
        Remove
      </button>
    </div>
  )
}

export default CartItem
