import { useForm } from 'react-hook-form'
import { useNavigate, useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout.jsx'
import { authService } from '../services/authService.js'

export default function ResetPassword() {
  const { token } = useParams()
  const nav = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()
  const pwd = watch('new_password')
  const onSubmit = async (data) => {
    try {
      await authService.resetPassword(token, data.new_password, data.confirm_password)
      toast.success('Password reset. Please sign in.')
      nav('/login')
    } catch (e) { toast.error(e.response?.data?.message || 'Reset failed') }
  }
  return (
    <AuthLayout title="Choose a new password" subtitle="Pick a strong one you haven't used recently"
      footer={<Link to="/login" className="text-brand-600 hover:underline">Back to sign in</Link>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <input type="password" className="input"
            {...register('new_password', { required: true, minLength: { value: 8, message: 'Min 8 chars' } })}/>
          {errors.new_password && <p className="text-xs text-rose-600">{errors.new_password.message}</p>}
        </div>
        <div>
          <label className="label">Confirm</label>
          <input type="password" className="input"
            {...register('confirm_password', { validate: (v) => v === pwd || 'Passwords must match' })}/>
          {errors.confirm_password && <p className="text-xs text-rose-600">{errors.confirm_password.message}</p>}
        </div>
        <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Resetting…' : 'Reset password'}</button>
      </form>
    </AuthLayout>
  )
}
