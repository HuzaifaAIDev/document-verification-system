import { Search } from 'lucide-react'
export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="input pl-10"/>
    </div>
  )
}
