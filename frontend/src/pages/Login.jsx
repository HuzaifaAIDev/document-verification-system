import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import AuthLayout from '../components/AuthLayout.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [show, setShow] = useState(false)

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password, data.remember)
      toast.success('Welcome back!')
      nav(loc.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (e) {
      const msg = e.response?.data?.message || 'Login failed'
      toast.error(msg)
      if (msg.toLowerCase().includes('verify')) nav('/verify-otp', { state: { email: data.email } })
    }
  }

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back to the Document Verification System"
      footer={<>Don't have an account? <Link to="/register" className="text-brand-600 font-medium hover:underline">Create one</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input className="input pl-10" type="email" placeholder="you@example.com"
              {...register('email', { required: 'Email required' })}/>
          </div>
          {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input className="input pl-10 pr-10" type={show ? 'text' : 'password'}
              {...register('password', { required: 'Password required' })}/>
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {show ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="rounded" {...register('remember')}/> Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">Forgot password?</Link>
        </div>
        <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </AuthLayout>
  )
}
