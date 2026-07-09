import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { Landmark, Eye, EyeOff } from 'lucide-react'
import Spinner from '../components/Spinner'

const INITIAL = {
  firstName: '', lastName: '', username: '',
  email: '', phoneNumber: '', password: '', confirmPassword: '',
}

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState(INITIAL)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const required = ['firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword']
    const trimmedForm = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value]),
    )

    if (required.some((k) => !trimmedForm[k])) {
      toast.error('Please fill in all required fields')
      return
    }
    if (trimmedForm.firstName.length < 1 || trimmedForm.lastName.length < 1) {
      toast.error('First name and last name must contain at least 1 character')
      return
    }
    if (trimmedForm.password !== trimmedForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (trimmedForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = trimmedForm
      await register(payload)
      toast.success('Account created successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-900 to-brand-700 px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-brand-100 rounded-xl mb-3">
            <Landmark size={32} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="text-sm text-gray-500 mt-1">Join BankApp today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="firstName">
                First name<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                className="input"
                placeholder="John"
                value={form.firstName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label className="label" htmlFor="lastName">
                Last name<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                className="input"
                placeholder="Doe"
                value={form.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="username">
              Username<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="input"
              placeholder="johndoe"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="input"
              placeholder="john@example.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="label" htmlFor="phoneNumber">Phone number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              className="input"
              placeholder="+1 555 0100"
              value={form.phoneNumber}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                className="input pr-10"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">
              Confirm password<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="input"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
