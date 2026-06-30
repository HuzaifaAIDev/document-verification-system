import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth.js'
import { authService } from '../services/authService.js'

export default function Profile() {
  const { user, refreshMe } = useAuth()
  const { register, handleSubmit } = useForm({ defaultValues: user })
  const { register: r2, handleSubmit: h2, watch, reset } = useForm()
  const np = watch('new_password')
  const [saving, setSaving] = useState(false)

  const save = async (data) => {
    setSaving(true)
    try { await authService.updateProfile(data); await refreshMe(); toast.success('Profile updated') }
    catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }
  const changePw = async (d) => {
    if (d.new_password !== d.confirm_password) return toast.error('Passwords must match')
    try { await authService.changePassword(d.old_password, d.new_password); toast.success('Password changed'); reset() }
    catch (e) { toast.error(e.response?.data?.message || 'Failed') }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Profile</h2>
        <form onSubmit={handleSubmit(save)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">First name</label><input className="input" {...register('first_name')}/></div>
            <div><label className="label">Last name</label><input className="input" {...register('last_name')}/></div>
          </div>
          <div><label className="label">Phone</label><input className="input" {...register('phone')}/></div>
          <div><label className="label">Country</label><input className="input" {...register('country')}/></div>
          <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      </div>
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={h2(changePw)} className="space-y-3">
          <div><label className="label">Current password</label><input type="password" className="input" {...r2('old_password', { required: true })}/></div>
          <div><label className="label">New password</label><input type="password" className="input" {...r2('new_password', { required: true })}/></div>
          <div><label className="label">Confirm</label><input type="password" className="input" {...r2('confirm_password', { required: true })}/></div>
          <button className="btn-primary">Update password</button>
        </form>
      </div>
    </div>
  )
}
