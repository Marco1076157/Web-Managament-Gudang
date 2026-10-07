/**
 * Textarea multi-baris dengan gaya sama dengan Input.
 */
const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error = '',
  required = false,
  disabled = false,
  rows = 4,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <span className="text-xs font-semibold text-slate-500 ml-1">{label}</span>
      )}
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full bg-slate-200 border-none rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y disabled:opacity-60"
      />
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
    </div>
  )
}

export default FormTextarea