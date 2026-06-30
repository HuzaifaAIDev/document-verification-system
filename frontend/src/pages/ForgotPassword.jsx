import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout.jsx'
import { authService } from '../services/authService.js'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [questions, setQuestions] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm()

  const loadQuestions = async () => {
    const email = getValues('email')
    if (!email) return toast.error('Enter your email first')
    try { setQuestions(await authService.securityQuestions(email)); setStep(2) }
    catch { toast.error('Could not load security questions') }
  }

  const onSubmit = async (data) => {
    try {
      const res = await authService.forgotPassword(data)
      toast.success(res.message)
      setStep(3)
    } catch (e) { toast.error(e.response?.data?.message || 'Request failed') }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Verify your identity to receive a reset link"
      footer={<Link to="/login" className="text-brand-600 hover:underline">Back to sign in</Link>}>
      {step === 1 && (
        <form onSubmit={(e) => { e.preventDefault(); loadQuestions() }} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" {...register('email', { required: true })}/>
          </div>
          <button className="btn-primary w-full">Continue</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First name</label>
              <input className="input" {...register('first_name', { required: true })}/></div>
            <div><label className="label">Last name</label>
              <input className="input" {...register('last_name', { required: true })}/></div>
          </div>
          <div><label className="label">Date of birth</label>
            <input type="date" className="input" {...register('date_of_birth', { required: true })}/></div>
          <div><label className="label">{questions?.question_1}</label>
            <input className="input" {...register('security_answer_1', { required: true })}/></div>
          <div><label className="label">{questions?.question_2}</label>
            <input className="input" {...register('security_answer_2', { required: true })}/></div>
          <button disabled={isSubmitting} className="btn-primary w-full">{isSubmitting ? 'Verifying…' : 'Send reset link'}</button>
        </form>
      )}
      {step === 3 && (
        <div className="text-center py-6">
          <div className="text-5xl mb-3">📧</div>
          <p className="text-slate-600 dark:text-slate-300">If your identity matches, a reset link has been emailed to you. The link expires in 15 minutes.</p>
        </div>
      )}
    </AuthLayout>
  )
}
