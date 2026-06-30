import { useRef, useEffect } from 'react'

export default function OTPInput({ length = 6, value, onChange }) {
  const refs = useRef([])
  useEffect(() => { refs.current[0]?.focus() }, [])
  const set = (i, v) => {
    if (!/^\d?$/.test(v)) return
    const next = value.split('')
    next[i] = v
    onChange(next.join('').padEnd(length, ''))
    if (v && i < length - 1) refs.current[i + 1]?.focus()
  }
  const onKey = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus()
  }
  const onPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (text) { e.preventDefault(); onChange(text.padEnd(length, '')) }
  }
  return (
    <div className="flex gap-2 justify-center" onPaste={onPaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i} ref={(el) => (refs.current[i] = el)}
          maxLength={1} value={value[i] || ''}
          onChange={(e) => set(i, e.target.value)} onKeyDown={(e) => onKey(i, e)}
          inputMode="numeric"
          className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-brand-500 focus:outline-none transition"
        />
      ))}
    </div>
  )
}
