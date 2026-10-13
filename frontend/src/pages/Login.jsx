import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const initialForm = { email: '', password: '' }

function Login() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/customers/login', {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      navigate('/home')
    } catch {
      setError('Invalid Credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">
          Log in to ShopKart
        </h1>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-full border border-neutral-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-black disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-neutral-900 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
