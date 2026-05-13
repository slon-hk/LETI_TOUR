import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTourStore } from '@/store/tourStore'

export function useUrlLocation() {
  const [params, setParams] = useSearchParams()
  const currentLocationId = useTourStore((s) => s.currentLocationId)
  const setLocation = useTourStore((s) => s.setLocation)

  // On mount: read ?location= and restore state
  useEffect(() => {
    const id = params.get('location')
    if (id) setLocation(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync store → URL
  useEffect(() => {
    if (currentLocationId) {
      setParams({ location: currentLocationId }, { replace: true })
    } else {
      setParams({}, { replace: true })
    }
  }, [currentLocationId, setParams])
}
