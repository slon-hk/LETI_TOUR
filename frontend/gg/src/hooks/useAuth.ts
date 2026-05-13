import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { login, logout } from '@/api/auth'
import type { Role } from '@/types/user'

function parseRole(): Role | null {
  const token = localStorage.getItem('access_token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]!))
    return payload.role as Role
  } catch {
    return null
  }
}

export function useAuth() {
  const [role, setRole] = useState<Role | null>(parseRole)
  const isAuthenticated = role !== null

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: (tokens) => {
      localStorage.setItem('access_token', tokens.access_token)
      localStorage.setItem('refresh_token', tokens.refresh_token)
      setRole(parseRole())
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => {
      const rt = localStorage.getItem('refresh_token') ?? ''
      return logout(rt)
    },
    onSettled: () => {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setRole(null)
    },
  })

  return { isAuthenticated, role, loginMutation, logoutMutation }
}
