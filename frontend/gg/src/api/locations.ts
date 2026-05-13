import type { Location } from '@/types/location'
import { apiClient } from './client'

export async function fetchLocations(): Promise<Location[]> {
  const { data } = await apiClient.get<Location[]>('/locations')
  return data
}

export async function fetchLocation(id: string): Promise<Location> {
  const { data } = await apiClient.get<Location>(`/locations/${id}`)
  return data
}

export async function createLocation(payload: Omit<Location, never>): Promise<Location> {
  const { data } = await apiClient.post<Location>('/locations', payload)
  return data
}

export async function updateLocation(id: string, payload: Location): Promise<Location> {
  const { data } = await apiClient.put<Location>(`/locations/${id}`, payload)
  return data
}

export async function deleteLocation(id: string): Promise<void> {
  await apiClient.delete(`/locations/${id}`)
}
