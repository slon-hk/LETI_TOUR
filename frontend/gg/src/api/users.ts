import type { User } from '@/types/user'
import { apiClient } from './client'

export interface UserCreate {
  username: string
  password: string
  role: 'superadmin' | 'editor'
}

export interface UserUpdate {
  username?: string
  password?: string
  role?: 'superadmin' | 'editor'
  is_active?: boolean
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>('/users')
  return data
}

export async function createUser(payload: UserCreate): Promise<User> {
  const { data } = await apiClient.post<User>('/users', payload)
  return data
}

export async function updateUser(id: number, payload: UserUpdate): Promise<User> {
  const { data } = await apiClient.put<User>(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}
