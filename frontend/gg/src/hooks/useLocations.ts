import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createLocation,
  deleteLocation,
  fetchLocations,
  updateLocation,
} from '@/api/locations'
import type { Location, LocationMap } from '@/types/location'

export const LOCATIONS_KEY = ['locations'] as const

export function useLocations() {
  return useQuery({
    queryKey: LOCATIONS_KEY,
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000,
    select: (data): LocationMap =>
      Object.fromEntries(data.map((l) => [l.id, l])),
  })
}

export function useLocationsList() {
  return useQuery({
    queryKey: LOCATIONS_KEY,
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Location) => createLocation(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOCATIONS_KEY }),
  })
}

export function useUpdateLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Location }) =>
      updateLocation(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: LOCATIONS_KEY }),
  })
}

export function useDeleteLocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: LOCATIONS_KEY })
      const previous = qc.getQueryData<Location[]>(LOCATIONS_KEY)
      qc.setQueryData<Location[]>(LOCATIONS_KEY, (old) =>
        old?.filter((l) => l.id !== id) ?? [],
      )
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(LOCATIONS_KEY, ctx.previous)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: LOCATIONS_KEY }),
  })
}
