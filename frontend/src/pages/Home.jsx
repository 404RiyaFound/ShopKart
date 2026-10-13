import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

function Home() {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await api.get('/customers/me')
        setCustomer(res.data)
      } catch {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchMe()
  }, [navigate])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-neutral-500">
        Loading...
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Welcome, {customer.fullName}!
          </h1>
          <div className="mt-6 space-y-2 text-neutral-600">
            <p>
              <span className="font-medium text-neutral-900">Email:</span> {customer.email}
            </p>
            <p>
              <span className="font-medium text-neutral-900">Phone:</span> {customer.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
