import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import CheckoutForm from '../components/CheckoutForm'
import OrderSummary from '../components/OrderSummary'
import { useCart } from '../context/CartContext'

const initialForm = { fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' }
const PHONE_REGEX = /^[6-9]\d{9}$/
const PINCODE_REGEX = /^\d{6}$/

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function validateShippingAddress(form) {
  const fullName = form.fullName.trim()
  const phone = form.phone.trim()
  const addressLine1 = form.addressLine1.trim()
  const city = form.city.trim()
  const state = form.state.trim()
  const pincode = form.pincode.trim()

  if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
    return { error: 'All fields are required' }
  }

  if (!PHONE_REGEX.test(phone)) {
    return { error: 'Enter a valid 10-digit phone number' }
  }

  if (!PINCODE_REGEX.test(pincode)) {
    return { error: 'Pincode must contain 6 digits' }
  }

  return { shippingAddress: { fullName, phone, addressLine1, city, state, pincode } }
}

function Checkout() {
  const { cartItems, loading: cartLoading, subtotal, clearCart } = useCart()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart')
    }
  }, [cartLoading, cartItems, navigate])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()
    setError('')

    const { error: validationError, shippingAddress } = validateShippingAddress(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setPlacing(true)

    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      setError('Unable to load the payment gateway. Please check your connection and try again.')
      setPlacing(false)
      return
    }

    let checkoutData
    try {
      const res = await api.post('/orders/create-payment-order', { shippingAddress })
      checkoutData = res.data
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to start checkout. Please try again.')
      setPlacing(false)
      return
    }

    const options = {
      key: checkoutData.key,
      amount: checkoutData.amount,
      currency: checkoutData.currency,
      name: 'ShopKart',
      description: 'ShopKart Order',
      order_id: checkoutData.razorpayOrderId,
      handler: async function (response) {
        try {
          const verifyRes = await api.post('/orders/verify-payment', {
            shopKartOrderId: checkoutData.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          clearCart()
          navigate(`/order-success/${verifyRes.data.order._id}`)
        } catch {
          setError('Payment verification failed. Your cart has not been cleared. Please try again.')
          setPlacing(false)
        }
      },
      modal: {
        ondismiss: function () {
          setPlacing(false)
        },
      },
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
      },
      theme: {},
    }

    const paymentObject = new window.Razorpay(options)

    paymentObject.on('payment.failed', function () {
      setError('Payment failed. Your cart has not been cleared. Please try again.')
      setPlacing(false)
    })

    paymentObject.open()
  }

  const summaryItems = cartItems.map((item) => ({
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }))

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900">Checkout</h1>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900">Shipping Details</h2>
            <CheckoutForm form={form} onChange={handleChange} />
          </div>

          <OrderSummary items={summaryItems} total={subtotal}>
            <button
              type="submit"
              disabled={placing}
              className="mt-6 w-full rounded-full bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-black disabled:opacity-60"
            >
              {placing ? 'Processing...' : 'Place Order'}
            </button>
          </OrderSummary>
        </form>
      </div>
    </div>
  )
}

export default Checkout
