import { useState, useEffect } from 'react'
import { userService, roleService } from '../../api'
import { UserCog, Users, Shield, Check, AlertCircle, Loader2 } from 'lucide-react'

const AssignRole = () => {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [userRes, roleRes] = await Promise.all([
        userService.getAll({ per_page: 100 }),
        roleService.getAll({ per_page: 100 }),
      ])
      setUsers(userRes.data || [])
      setRoles(roleRes.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getUserRoleId = (user) => {
    // Prioritaskan role_id (dipakai sebagai <option value>).
    // Backend mengirim `role` sebagai NAMA ("keeper"), bukan id, jadi kalau
    // `role` dipakai langsung nilainya tidak akan cocok dengan value option
    // dan dropdown selalu terlihat kosong.
    if (user?.role_id != null) return user.role_id

    const r = user?.role
    if (r && typeof r === 'object') return r.id

    // Fallback: cari id dari nama role di daftar roles yang sudah di-load.
    const byName = roles.find((x) => x.name === r)
    if (byName) return byName.id

    return user?.roles?.[0]?.id ?? ''
  }

  const handleChange = async (userId, roleId) => {
    setSavingId(userId)
    setError('')
    setSuccess('')
    try {
      await userService.assignRole(userId, roleId)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role_id: roleId,
                role: roles.find((r) => String(r.id) === String(roleId)) || u.role,
              }
            : u
        )
      )
      setSuccess('Role berhasil diperbarui.')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan role.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCog className="w-6 h-6 text-blue-600" aria-hidden="true" />
          Assign Role
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Pilih role untuk setiap user di bawah ini.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium p-3 rounded-2xl">
          <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-10 w-40 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-500">Belum ada user.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-10 h-10 object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>

                <div className="flex items-center gap-2 sm:w-64">
                  <div className="relative flex-1">
                    <Shield
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                      aria-hidden="true"
                    />
                    <select
                      value={getUserRoleId(user)}
                      onChange={(e) => handleChange(user.id, e.target.value)}
                      disabled={savingId === user.id}
                      aria-label={`Role untuk ${user.name}`}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:opacity-60 cursor-pointer"
                    >
                      <option value="">-- Pilih Role --</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {savingId === user.id && (
                    <Loader2
                      className="w-4 h-4 text-blue-600 animate-spin shrink-0"
                      aria-label="Menyimpan"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AssignRole