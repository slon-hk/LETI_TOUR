import { useEffect, useMemo, useState } from 'react'
import type { Location, LocationMap } from '@/types/location'
import { bfsPath, buildNavGraph } from '@/utils/routing'

const BUILDINGS: Record<string, { name: string; floors: number[]; mapPos: { x: number; y: number } }> = {
  '1_2': { name: '1/2 Корпус', floors: [4, 3, 2, 1], mapPos: { x: 25, y: 70 } },
  '3':   { name: '3 Корпус',   floors: [4, 3, 2, 1], mapPos: { x: 60, y: 35 } },
  '4':   { name: '4 Корпус',   floors: [5, 4, 3, 2, 1], mapPos: { x: 75, y: 55 } },
  '5':   { name: '5 Корпус',   floors: [6, 5, 4, 3, 2, 1], mapPos: { x: 45, y: 50 } },
  '7':   { name: '7 Корпус',   floors: [4, 3, 2, 1], mapPos: { x: 70, y: 25 } },
}

type NavStep = 'pickStart' | 'pickDest' | 'showPath'

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

  // Navigation state
  const [navMode, setNavMode] = useState(false)
  const [navStep, setNavStep] = useState<NavStep>('pickStart')
  const [navFreeStart, setNavFreeStart] = useState<{ x: number; y: number } | null>(null)
  const [navStartNode, setNavStartNode] = useState<string | null>(null)
  const [navDest, setNavDest] = useState<string | null>(null)
  const [navPath, setNavPath] = useState<string[] | null>(null)
  const [pathNotFound, setPathNotFound] = useState(false)

  useEffect(() => {
    if (currentLocation?.corpus) {
      setActiveCorpus(currentLocation.corpus)
      setActiveFloor(currentLocation.floor)
    }
  }, [currentLocation])

  // Reset navigation when the user switches to a different building
  useEffect(() => {
    setNavMode(false)
    setNavStep('pickStart')
    setNavFreeStart(null)
    setNavStartNode(null)
    setNavDest(null)
    setNavPath(null)
    setPathNotFound(false)
  }, [activeCorpus])

  // Compute BFS path when both endpoints are known
  useEffect(() => {
    if (!navStartNode || !navDest) return
    const graph = buildNavGraph(tourData)
    const path = bfsPath(graph, navStartNode, navDest)
    if (path) {
      setNavPath(path)
      setPathNotFound(false)
    } else {
      setNavPath(null)
      setPathNotFound(true)
    }
    setNavStep('showPath')
  }, [navStartNode, navDest, tourData])

  function resetNav() {
    setNavStep('pickStart')
    setNavFreeStart(null)
    setNavStartNode(null)
    setNavDest(null)
    setNavPath(null)
    setPathNotFound(false)
  }

  function toggleNavMode() {
    if (navMode) {
      setNavMode(false)
      resetNav()
    } else {
      setNavMode(true)
    }
  }

  // Click anywhere on the floor plan in pickStart mode → snap to nearest location node
  function handleFloorPlanClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!navMode || navStep !== 'pickStart') return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const locsOnFloor = Object.values(tourData).filter(
      (loc) => loc.corpus === activeCorpus && loc.floor === activeFloor,
    )
    if (!locsOnFloor.length) return

    const nearest = locsOnFloor.reduce((a, b) =>
      Math.hypot(a.indoorPosition.x - x, a.indoorPosition.y - y) <
      Math.hypot(b.indoorPosition.x - x, b.indoorPosition.y - y)
        ? a
        : b,
    )

    setNavFreeStart({ x, y })
    setNavStartNode(nearest.id)
    setNavStep('pickDest')
  }

  function handleDotClick(id: string) {
    if (navMode) {
      if ((navStep === 'pickDest' || navStep === 'showPath') && id !== navStartNode) {
        setNavDest(id)
      }
    } else {
      onSelectLocation(id)
    }
  }

  // Path segments visible on the currently shown floor (consecutive runs of same-floor nodes)
  const floorSegments = useMemo(() => {
    if (!navPath || !activeCorpus) return []
    const segments: Array<{ x: number; y: number }[]> = []
    let current: { x: number; y: number }[] = []
    for (const id of navPath) {
      const loc = tourData[id]
      if (loc?.corpus === activeCorpus && loc?.floor === activeFloor) {
        current.push(loc.indoorPosition)
      } else {
        if (current.length) { segments.push(current); current = [] }
      }
    }
    if (current.length) segments.push(current)
    return segments
  }, [navPath, activeCorpus, activeFloor, tourData])

  // Ordered list of floors in the current corpus that the path visits
  const pathFloors = useMemo(() => {
    if (!navPath || !activeCorpus) return []
    const seen: number[] = []
    for (const id of navPath) {
      const loc = tourData[id]
      if (loc?.corpus === activeCorpus && !seen.includes(loc.floor)) {
        seen.push(loc.floor)
      }
    }
    return seen
  }, [navPath, activeCorpus, tourData])

  // ── Widget: minimised button ──────────────────────────────────────────────
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

  // ── Campus overview (no corpus selected) ─────────────────────────────────
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

  // ── Floor plan view ───────────────────────────────────────────────────────
  return (
    <div
      className={`flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-md relative z-10 transition-all
        ${isWidget
          ? 'w-[240px] sm:w-80 h-56 sm:h-72 p-2 rounded-2xl border border-white/20 shadow-2xl'
          : 'w-full h-full p-3 sm:p-8 pt-24 sm:pt-8'
        }`}
    >
      {/* Widget controls */}
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

      {/* Full-mode header */}
      {!isWidget && (
        <div className="flex justify-between items-center mb-2">
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
          {/* Navigation mode toggle */}
          <button
            onClick={toggleNavMode}
            title={navMode ? 'Выйти из режима маршрута' : 'Построить маршрут'}
            className={`p-2 rounded-xl transition-colors ${
              navMode
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Navigation instruction strip */}
      {!isWidget && navMode && (
        <div
          className={`mb-2 px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between gap-2 ${
            pathNotFound
              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
          }`}
        >
          <span>
            {navStep === 'pickStart' && '👆 Нажмите на план — вы здесь'}
            {navStep === 'pickDest' && '🎯 Нажмите на точку назначения'}
            {navStep === 'showPath' && pathNotFound && 'Маршрут не найден — нет прямой связи между точками'}
            {navStep === 'showPath' && !pathNotFound && pathFloors.length > 1 && `Путь через этажи: ${pathFloors.join(' → ')}`}
            {navStep === 'showPath' && !pathNotFound && pathFloors.length <= 1 && 'Маршрут построен'}
          </span>
          {navStep !== 'pickStart' && (
            <button onClick={resetNav} className="underline opacity-70 hover:opacity-100 whitespace-nowrap">
              Сбросить
            </button>
          )}
        </div>
      )}

      {/* Floor plan container */}
      <div
        className="relative w-full flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-800 mt-6 sm:mt-0"
        onClick={handleFloorPlanClick}
        style={{ cursor: navMode && navStep === 'pickStart' ? 'crosshair' : 'default' }}
      >
        <img
          src={`/map_area_${activeCorpus}_floor_${activeFloor}.svg`}
          className="w-full h-full object-contain p-2 dark:invert opacity-80"
          alt={`План ${bData?.name} этаж ${activeFloor}`}
        />

        {/* SVG route overlay — viewBox 0-100 maps 1:1 to indoorPosition percentages */}
        {navMode && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Route polyline segments on current floor */}
            {floorSegments.map((seg, i) =>
              seg.length >= 2 ? (
                <polyline
                  key={i}
                  points={seg.map((p) => `${p.x},${p.y}`).join(' ')}
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="3 1.5"
                />
              ) : null,
            )}

            {/* Dashed connector from free-click point to nearest snapped node */}
            {navFreeStart &&
              navStartNode &&
              tourData[navStartNode]?.corpus === activeCorpus &&
              tourData[navStartNode]?.floor === activeFloor && (
                <line
                  x1={navFreeStart.x}
                  y1={navFreeStart.y}
                  x2={tourData[navStartNode].indoorPosition.x}
                  y2={tourData[navStartNode].indoorPosition.y}
                  stroke="#22c55e"
                  strokeWidth="1"
                  strokeDasharray="2 1.5"
                  opacity="0.8"
                />
              )}

            {/* Free-click start dot */}
            {navFreeStart && navStep !== 'pickStart' && (
              <circle cx={navFreeStart.x} cy={navFreeStart.y} r="2.5" fill="#22c55e" stroke="white" strokeWidth="0.8" />
            )}

            {/* Snapped start node */}
            {navStartNode &&
              tourData[navStartNode]?.corpus === activeCorpus &&
              tourData[navStartNode]?.floor === activeFloor && (
                <circle
                  cx={tourData[navStartNode].indoorPosition.x}
                  cy={tourData[navStartNode].indoorPosition.y}
                  r="2.5"
                  fill="#22c55e"
                  stroke="white"
                  strokeWidth="0.8"
                />
              )}

            {/* Destination node */}
            {navDest &&
              tourData[navDest]?.corpus === activeCorpus &&
              tourData[navDest]?.floor === activeFloor && (
                <circle
                  cx={tourData[navDest].indoorPosition.x}
                  cy={tourData[navDest].indoorPosition.y}
                  r="2.5"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="0.8"
                />
              )}
          </svg>
        )}

        {/* Floor selector */}
        <div
          className={`absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 rounded-full py-1 px-0.5 shadow-xl flex flex-col gap-1 border dark:border-slate-700 z-30 ${
            isWidget ? 'scale-75 origin-right' : ''
          }`}
        >
          {bData?.floors.map((f) => (
            <button
              key={f}
              onClick={(e) => { e.stopPropagation(); setActiveFloor(f) }}
              className={`w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-[10px] sm:text-sm transition-colors ${
                activeFloor === f
                  ? 'bg-leti text-white'
                  : 'dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              } ${
                navPath && pathFloors.includes(f) && activeFloor !== f
                  ? 'ring-2 ring-blue-400 ring-offset-1'
                  : ''
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Location dots */}
        {Object.values(tourData)
          .filter((loc) => loc.corpus === activeCorpus && loc.floor === activeFloor)
          .map((loc) => (
            <button
              key={loc.id}
              onClick={(e) => { e.stopPropagation(); handleDotClick(loc.id) }}
              style={{
                left: `${loc.indoorPosition.x}%`,
                top: `${loc.indoorPosition.y}%`,
                transform: 'translate(-50%, -50%)',
                // In pickStart phase dots are invisible to pointer so the container click fires
                pointerEvents: navMode && navStep === 'pickStart' ? 'none' : undefined,
              }}
              title={loc.name}
              className={`absolute rounded-full border-2 border-white shadow-lg transition-all z-10 ${
                isWidget ? 'w-2 h-2' : 'w-3 h-3 sm:w-4 sm:h-4 hover:scale-125'
              } ${
                navMode && loc.id === navStartNode
                  ? 'bg-green-500 scale-125'
                  : navMode && loc.id === navDest
                    ? 'bg-red-500 scale-125'
                    : currentLocation?.id === loc.id
                      ? 'bg-leti-gold scale-125'
                      : 'bg-leti'
              }`}
            />
          ))}
      </div>
    </div>
  )
}
