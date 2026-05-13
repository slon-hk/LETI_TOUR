import { useEffect, useState } from 'react'
import type { Location, LocationMap } from '@/types/location'

const BUILDINGS: Record<string, { name: string; address: string; floors: number[]; mapPos: { x: number; y: number } }> = {
  '1_2': { name: '1/2 Корпус', address: 'Попова 5к1', floors: [4, 3, 2, 1], mapPos: { x: 25, y: 70 } },
  '3':   { name: '3 Корпус',   address: 'Попова 5к3', floors: [4, 3, 2, 1], mapPos: { x: 60, y: 35 } },
  '4':   { name: '4 Корпус',   address: 'Попова 5',   floors: [5, 4, 3, 2, 1], mapPos: { x: 75, y: 55 } },
  '5':   { name: '5 Корпус',   address: 'Попова 5',   floors: [6, 5, 4, 3, 2, 1], mapPos: { x: 45, y: 50 } },
  '7':   { name: '7 Корпус',   address: 'Попова 5к7', floors: [4, 3, 2, 1], mapPos: { x: 70, y: 25 } },
}

interface IndoorMapProps {
  tourData: LocationMap
  currentLocation: Location | null
  onSelectLocation: (id: string) => void
  isWidget?: boolean
  onExpand?: () => void
}

export function IndoorMap({
  tourData,
  currentLocation,
  onSelectLocation,
  isWidget = false,
  onExpand,
}: IndoorMapProps) {
  const [activeCorpus, setActiveCorpus] = useState<string | null>(null)
  const [activeFloor, setActiveFloor] = useState(1)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    if (currentLocation?.corpus) {
      setActiveCorpus(currentLocation.corpus)
      setActiveFloor(currentLocation.floor)
    }
  }, [currentLocation])

  if (isWidget && isMinimized) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); setIsMinimized(false) }}
        className="w-14 h-14 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-2xl flex items-center justify-center text-leti dark:text-blue-400 border border-white/20 hover:scale-105 transition-all"
        aria-label="Открыть план здания"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      </button>
    )
  }

  if (!activeCorpus) {
    return (
      <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-none pt-4 px-4 shadow-2xl relative z-10">
        <div className="mb-4 mt-16 sm:mt-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold dark:text-slate-100">Карта</h1>
        </div>
        <div className="relative w-full flex-1 min-h-[300px] flex items-center justify-center">
          <img src="/map_all_areas.png" className="w-full h-full object-contain dark:invert opacity-80" alt="Карта кампуса" />
          {Object.entries(BUILDINGS).map(([key, b]) => (
            <button
              key={key}
              onClick={() => { setActiveCorpus(key); setActiveFloor(1) }}
              style={{ left: `${b.mapPos.x}%`, top: `${b.mapPos.y}%`, transform: 'translate(-50%, -50%)' }}
              className="absolute z-10 p-1.5 bg-white/90 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 rounded-lg shadow-md text-[10px] font-bold text-leti hover:scale-110 transition-transform"
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const bData = BUILDINGS[activeCorpus]

  return (
    <div
      className={`flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md relative z-10 transition-all
        ${isWidget
          ? 'w-[240px] sm:w-80 h-56 sm:h-72 p-2 rounded-2xl border border-white/20 shadow-2xl'
          : 'w-full h-full p-3 sm:p-8 pt-24 sm:pt-8'
        }`}
    >
      {isWidget && (
        <div className="absolute top-2 left-2 right-2 flex justify-between z-30">
          <button
            onClick={() => setIsMinimized(true)}
            className="bg-gray-100 dark:bg-slate-800 p-1.5 rounded-lg shadow-sm text-gray-500"
            aria-label="Свернуть"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={onExpand}
            className="bg-leti text-white p-1.5 rounded-lg shadow-sm"
            aria-label="Развернуть"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
      )}

      {!isWidget && (
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setActiveCorpus(null)}
            className="text-leti dark:text-slate-300 font-bold flex items-center gap-1"
            aria-label="Назад к карте"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-lg sm:text-2xl font-black dark:text-white">{bData?.name}</div>
        </div>
      )}

      <div className="relative w-full flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 mt-6 sm:mt-0">
        <img
          src={`/map_area_${activeCorpus}_floor_${activeFloor}.svg`}
          className="w-full h-full object-contain p-2 dark:invert opacity-80"
          alt={`План ${bData?.name} этаж ${activeFloor}`}
        />

        <div className={`absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 rounded-full py-1 px-0.5 shadow-xl flex flex-col gap-1 border dark:border-slate-700 ${isWidget ? 'scale-75 origin-right' : ''}`}>
          {bData?.floors.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-sm transition-colors ${
                activeFloor === f ? 'bg-leti text-white' : 'dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {Object.values(tourData)
          .filter((loc) => loc.corpus === activeCorpus && loc.floor === activeFloor)
          .map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              style={{
                left: `${loc.indoorPosition.x}%`,
                top: `${loc.indoorPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              title={loc.name}
              className={`absolute w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white shadow-lg transition-all hover:scale-125 ${
                currentLocation?.id === loc.id ? 'bg-leti-gold scale-125' : 'bg-leti'
              }`}
            />
          ))}
      </div>
    </div>
  )
}
