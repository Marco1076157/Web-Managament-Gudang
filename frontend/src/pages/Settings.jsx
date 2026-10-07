import { useState } from 'react'
import { Settings as SettingsIcon, Save, Bell, Globe, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../i18n/LanguageContext'

const Settings = () => {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [prefs, setPrefs] = useState({
    emailNotif: true,
    lowStockAlert: true,
    language: 'id',
  })
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" aria-hidden="true" />
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Kelola profil dan preferensi akun Anda.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium p-3 rounded-2xl">
          <Save className="w-4 h-4 shrink-0" aria-hidden="true" />
          Pengaturan berhasil disimpan.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
            Profil
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="settings-name"
                className="text-xs font-semibold text-slate-500 ml-1"
              >
                Nama Lengkap
              </label>
              <input
                id="settings-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="settings-email"
                className="text-xs font-semibold text-slate-500 ml-1"
              >
                Email
              </label>
              <input
                id="settings-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" aria-hidden="true" />
            Preferensi
          </h2>
          <div className="space-y-3">
              <label className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl cursor-pointer">
                <span className="text-sm font-medium text-slate-700">
                  Notifikasi Transaksi
                </span>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  checked={prefs.emailNotif}
                  onChange={() => toggle('emailNotif')}
                />
              </label>
            <label className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl cursor-pointer">
              <span className="text-sm font-medium text-slate-700">
                Alert Stok Menipis
              </span>
              <input
                type="checkbox"
                checked={prefs.lowStockAlert}
                onChange={() => toggle('lowStockAlert')}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </label>

            <div className="flex flex-col gap-1.5 p-3">
              <label
                htmlFor="settings-lang"
                className="text-xs font-semibold text-slate-500 ml-1 flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                Bahasa
              </label>
              <select
                id="settings-lang"
                value={language}
                onChange={(e) => {
                  const val = e.target.value
                  setLanguage(val)
                  setPrefs({ ...prefs, language: val })
                }}
                className="w-full bg-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-6 py-3 rounded-full shadow-lg transition-all cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings