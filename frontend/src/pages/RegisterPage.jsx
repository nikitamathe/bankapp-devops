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
    const required = ['firstName', 'lastName', 'username', 'email', 'password']
    if (required.some((k) => !form[k])) {
      toast.error('Please fill in all required fields')
      return
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      await register(payload)
      toast.success('Account created successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ name, label, type = 'text', required = false, placeholder = '' }) => (
    <div>
      <label className="label" htmlFor={name}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="input"
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        disabled={loading}
      />
    </div>
  )

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
            <Field name="firstName" label="First name" required placeholder="John" />
            <Field name="lastName"  label="Last name"  required placeholder="Doe" />
          </div>
          <Field name="username" label="Username" required placeholder="johndoe" />
          <Field name="email" label="Email" type="email" required placeholder="john@example.com" />
          <Field name="phoneNumber" label="Phone number" placeholder="+1 555 0100" />

          <div>
            <label className="label" htmlFor="password">
              Password<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
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
