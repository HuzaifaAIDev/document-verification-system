import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout.jsx'
import OTPInput from '../components/OTPInput.jsx'
import { authService } from '../services/authService.js'

export default function VerifyOTP() {
  const loc = useLocation()
  const nav = useNavigate()
  const [email, setEmail] = useState(loc.state?.email || '')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (otp.replace(/\s/g, '').length !== 6) return toast.error('Enter the 6-digit code')
    setSubmitting(true)
    try {
      await authService.verifyOtp(email, otp)
      toast.success('Email verified! You can now sign in.')
      nav('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
    } finally { setSubmitting(false) }
  }
  const resend = async () => {
    if (!email) return toast.error('Enter your email first')
    setResending(true)
    try {
      await authService.resendOtp(email)
      toast.success('A new OTP was sent')
    } catch (err) { toast.error('Could not resend OTP') }
    finally { setResending(false) }
  }
  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent to your inbox">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </div>
        <OTPInput value={otp} onChange={setOtp}/>
        <button disabled={submitting} className="btn-primary w-full">{submitting ? 'Verifying…' : 'Verify email'}</button>
        <button type="button" onClick={resend} disabled={resending} className="btn-secondary w-full">
          {resending ? 'Sending…' : 'Resend OTP'}
        </button>
      </form>
    </AuthLayout>
  )
}
