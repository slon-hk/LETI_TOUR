import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, deleteUser, fetchUsers, updateUser } from '@/api/users'
import { Button } from '@/components/ui/Button'
import type { Role, User } from '@/types/user'

const USERS_KEY = ['users'] as const

export function UserManagement() {
  const qc = useQueryClient()
  const { data: users = [], isLoading } = useQuery({ queryKey: USERS_KEY, queryFn: fetchUsers })
  const [showForm, setShowForm] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<Role>('editor')

  const createMutation = useMutation({
    mutationFn: () => createUser({ username: newUsername, password: newPassword, role: newRole }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USERS_KEY })
      setShowForm(false)
      setNewUsername('')
      setNewPassword('')
    },
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      updateUser(id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  })

  const handleDelete = (user: User) => {
    if (!window.confirm(`Удалить пользователя «${user.username}»?`)) return
    deleteMutation.mutate(user.id)
  }

  return (
    <div className="mt-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Пользователи</h2>
        <Button onClick={() => setShowForm(true)} size="md">+ Добавить</Button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate() }}
          className="bg-slate-900 p-6 rounded-2xl border border-slate-800 mb-6 space-y-4"
        >
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              placeholder="Логин"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold"
            >
              <option value="editor">Editor</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" size="sm" loading={createMutation.isPending}>Создать</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Отмена</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-14 bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-4">Логин</th>
                <th className="p-4">Роль</th>
                <th className="p-4">Статус</th>
                <th className="p-4">Создан</th>
                <th className="p-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 font-bold text-white">{user.username}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      user.role === 'superadmin' ? 'bg-leti text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      user.is_active ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {user.is_active ? 'Активен' : 'Отключён'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-3">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: user.id, is_active: !user.is_active })}
                      className="text-slate-400 hover:text-white text-xs font-bold transition-colors"
                    >
                      {user.is_active ? 'Отключить' : 'Включить'}
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="text-red-500/70 hover:text-red-400 text-xs font-bold transition-colors"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
