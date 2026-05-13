import { useState } from 'react'
import type { LocationMap } from '@/types/location'

interface MinimapProps {
  tourData: LocationMap
  currentLocationId: string | null
  onMapClick: (id: string) => void
}

export function Minimap({ tourData, currentLocationId, onMapClick }: MinimapProps) {
  const [isOpen, setIsOpen] = useState(false)
  const locations = Object.values(tourData)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Навигация"
        className="w-16 h-16 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl flex flex-col items-center justify-center p-2 hover:scale-105 transition-all"
      >
        <svg className="w-7 h-7 text-leti dark:text-blue-400 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Где я?</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-2xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-900 dark:text-white text-lg">Навигация</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="Закрыть"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {locations.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Локации не загружены</p>
              )}
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => { onMapClick(loc.id); setIsOpen(false) }}
                  className={`p-3 rounded-xl text-left text-sm font-bold transition-colors ${
                    currentLocationId === loc.id
                      ? 'bg-leti text-white'
                      : 'bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {loc.name || loc.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
