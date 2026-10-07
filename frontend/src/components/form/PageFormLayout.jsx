import { ArrowLeft, CheckCircle2 } from 'lucide-react'

/**
 * Kerangka halaman form (bukan modal).
 *
 * Sisi kiri  : "Complete The Form" -> kolom-kolom input
 * Sisi kanan : "Quick Guide to Adding..." -> card abu-abu berisi checklist/tips
 * Bawah     : tombol Cancel (merah/putih) + Submit (biru solid)
 */
const PageFormLayout = ({
  title,
  subtitle,
  guideTitle = 'Quick Guide to Adding...',
  guideItems = [],
  guideFooter,
  onBack,
  onCancel,
  onSubmit,
  submitLabel = 'Create Now',
  cancelLabel = 'Cancel',
  submitting = false,
  children,
  headerExtra = null,
}) => {
  return (
    <div className="space-y-6">
      {/* Header halaman */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Kembali"
          className="mt-1 p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Dua kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* KIRI: form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xl">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Complete The Form</h2>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-5">
            {children}

            {/* Aksi */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="px-6 py-3 rounded-full bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
              >
                {cancelLabel}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg transition-all active:scale-95 disabled:opacity-60 inline-flex items-center justify-center gap-2"
              >
                {submitting && (
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {submitLabel}
              </button>
            </div>
          </form>
        </div>

        {/* KANAN: panduan */}
        <aside className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
          <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-900">{guideTitle}</h3>
            <ul className="mt-4 space-y-3">
              {guideItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2
                    className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            {guideFooter && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                {guideFooter}
              </div>
            )}
          </div>

          {headerExtra}
        </aside>
      </div>
    </div>
  )
}

export default PageFormLayout