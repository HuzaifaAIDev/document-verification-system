import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout.jsx'
import { authService } from '../services/authService.js'

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'employee' },
  })
  const nav = useNavigate()
  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      await authService.register(data)
      toast.success('Check your email for the verification code')
      nav('/verify-otp', { state: { email: data.email } })
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed')
    }
  }

  const F = ({ name, label, type = 'text', ...rest }) => (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} {...register(name, { required: `${label} required` })} {...rest}/>
      {errors[name] && <p className="text-xs text-rose-600 mt-1">{errors[name].message}</p>}
    </div>
  )

  return (
    <AuthLayout title="Create your account" subtitle="Enterprise document verification at your fingertips"
      footer={<>Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link></>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <F name="first_name" label="First name"/>
          <F name="last_name" label="Last name"/>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <F name="username" label="Username"/>
          <F name="phone" label="Phone"/>
        </div>
        <F name="email" label="Email" type="email"/>
        <div className="grid grid-cols-2 gap-3">
          <F name="date_of_birth" label="Date of Birth" type="date"/>
          <div>
            <label className="label">Gender</label>
            <select className="input" {...register('gender')}>
              <option value="">Select…</option><option>male</option><option>female</option><option>other</option>
            </select>
          </div>
        </div>
        <F name="country" label="Country"/>
        <div>
          <label className="label">Password</label>
          <input type="password" className="input"
            {...register('password', { required: 'Password required', minLength: { value: 8, message: 'Min 8 chars' } })}/>
          <p className="text-xs text-slate-500 mt-1">8+ chars with upper, lower, number, special.</p>
          {errors.password && <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="label">Confirm password</label>
          <input type="password" className="input"
            {...register('confirm_password', { validate: (v) => v === password || 'Passwords do not match' })}/>
          {errors.confirm_password && <p className="text-xs text-rose-600 mt-1">{errors.confirm_password.message}</p>}
        </div>
        <F name="security_question_1" label="Security Question 1" placeholder="e.g. What was your first pet's name?"/>
        <F name="security_answer_1" label="Answer 1"/>
        <F name="security_question_2" label="Security Question 2" placeholder="e.g. Your birth city?"/>
        <F name="security_answer_2" label="Answer 2"/>
        <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Creating…' : 'Create account'}</button>
      </form>
    </AuthLayout>
  )
}
