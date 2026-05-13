import { create } from 'zustand'
import type { Marker } from '@/types/location'

export type ViewMode = 'map' | 'pano'
export type MapType = 'campus' | 'indoor'
export type Theme = 'light' | 'dark'

export interface ActiveInfo {
  title?: string
  text?: string
  audio?: string
  video?: string
  model_3d?: string
  image?: string
}

interface TourState {
  currentLocationId: string | null
  viewMode: ViewMode
  mapType: MapType
  theme: Theme
  activeInfo: ActiveInfo | null

  setLocation: (id: string) => void
  backToMap: () => void
  setViewMode: (mode: ViewMode) => void
  setMapType: (type: MapType) => void
  setActiveInfo: (info: ActiveInfo | null) => void
  toggleTheme: () => void
  openMarker: (marker: Marker) => void
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('theme') as Theme | null
  return saved ?? 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useTourStore = create<TourState>((set) => {
  const initialTheme = getInitialTheme()
  applyTheme(initialTheme)

  return {
    currentLocationId: null,
    viewMode: 'map',
    mapType: 'campus',
    theme: initialTheme,
    activeInfo: null,

    setLocation: (id) =>
      set({ currentLocationId: id, viewMode: 'pano', mapType: 'indoor' }),

    backToMap: () =>
      set({ viewMode: 'map', currentLocationId: null, activeInfo: null, mapType: 'campus' }),

    setViewMode: (viewMode) => set({ viewMode }),
    setMapType: (mapType) => set({ mapType }),
    setActiveInfo: (activeInfo) => set({ activeInfo }),

    toggleTheme: () =>
      set((s) => {
        const next: Theme = s.theme === 'light' ? 'dark' : 'light'
        localStorage.setItem('theme', next)
        applyTheme(next)
        return { theme: next }
      }),

    openMarker: (marker: Marker) => {
      if (marker.type === 'nav' && marker.target) {
        set({ currentLocationId: marker.target, viewMode: 'pano' })
      } else {
        set({
          activeInfo: {
            title: marker.title ?? marker.tooltip,
            text: marker.text ?? undefined,
            audio: marker.audio ?? undefined,
            video: marker.video ?? undefined,
            model_3d: marker.model_3d ?? undefined,
            image: marker.image ?? undefined,
          },
        })
      }
    },
  }
})
