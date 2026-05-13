import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { LocationTable } from './LocationTable'
import { LocationForm } from './LocationForm'
import { UserManagement } from './UserManagement'
import type { Location } from '@/types/location'

type AdminView = 'table' | 'create' | 'edit'

export default function AdminPage() {
  const { isAuthenticated, role, loginMutation, logoutMutation } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [view, setView] = useState<AdminView>('table')
  const [editingLocation, setEditingLocation] = useState<Location | undefined>()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <form
          onSubmit={handleLogin}
          className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-md mx-4"
        >
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="ЛЭТИ" className="h-14 opacity-90" />
          </div>
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Вход в панель</h2>

          {loginMutation.isError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-xl text-red-400 text-sm text-center">
              Неверный логин или пароль
            </div>
          )}

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-4 rounded-2xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-leti border border-slate-700"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 rounded-2xl bg-slate-800 text-white outline-none focus:ring-2 focus:ring-leti border border-slate-700"
            />
          </div>
          <Button
            type="submit"
            className="w-full mt-5"
            size="lg"
            loading={loginMutation.isPending}
          >
            Войти
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 pt-24">
      <Header />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
              role === 'superadmin' ? 'bg-leti text-white' : 'bg-slate-700 text-slate-300'
            }`}>
              {role}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            loading={logoutMutation.isPending}
          >
            Выйти
          </Button>
        </div>

        {view === 'table' && (
          <>
            <LocationTable
              onEdit={(loc) => { setEditingLocation(loc); setView('edit') }}
              onAdd={() => { setEditingLocation(undefined); setView('create') }}
            />
            {role === 'superadmin' && <UserManagement />}
          </>
        )}

        {(view === 'create' || view === 'edit') && (
          <LocationForm
            initial={view === 'edit' ? editingLocation : undefined}
            onCancel={() => setView('table')}
            onSuccess={() => setView('table')}
          />
        )}
      </div>
    </div>
  )
}
