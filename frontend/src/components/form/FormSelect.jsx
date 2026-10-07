import { ChevronDown } from 'lucide-react'

/**
 * Dropdown select dengan gaya sama persis dengan Input (bg-slate-200, rounded-2xl).
 * Dipakai untuk kategori & keeper agar tampilan form konsisten.
 */
const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Pilih opsi',
  error = '',
  required = false,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-xs font-semibold text-slate-500 ml-1">{label}</span>
      )}

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className="w-full appearance-none bg-slate-200 border-none rounded-2xl px-4 py-3 pr-10 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-60"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  )
}

export default FormSelect