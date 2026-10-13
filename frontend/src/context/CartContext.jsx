import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refreshCart = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/cart')
      setCartItems(res.data.cart)
    } catch {
      setError('Unable to load your cart.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  async function addToCart(productId) {
    const res = await api.post(`/cart/${productId}`)
    setCartItems(res.data.cart)
  }

  async function updateQuantity(productId, quantity) {
    const res = await api.patch(`/cart/${productId}`, { quantity })
    setCartItems(res.data.cart)
  }

  async function removeFromCart(productId) {
    const res = await api.delete(`/cart/${productId}`)
    setCartItems(res.data.cart)
  }

  function clearCart() {
    setCartItems([])
  }

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const value = {
    cartItems,
    loading,
    error,
    itemCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
