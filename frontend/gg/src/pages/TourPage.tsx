import { Header } from '@/components/layout/Header'
import { CampusMap } from '@/components/map/CampusMap'
import { IndoorMap } from '@/components/map/IndoorMap'
import { Minimap } from '@/components/map/Minimap'
import { TourViewer } from '@/components/tour/TourViewer'
import { InfoSheet } from '@/components/tour/InfoSheet'
import { TourErrorBoundary } from '@/components/errors/TourErrorBoundary'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { useLocations } from '@/hooks/useLocations'
import { useUrlLocation } from '@/hooks/useUrlLocation'
import { useTourStore } from '@/store/tourStore'
import type { LocationMap } from '@/types/location'

export default function TourPage() {
  const { data: tourData, isLoading, error } = useLocations()
  const {
    viewMode,
    mapType,
    currentLocationId,
    activeInfo,
    setLocation,
    backToMap,
    setMapType,
    setActiveInfo,
  } = useTourStore()

  useUrlLocation()

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-sm space-y-3 px-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <p className="text-leti dark:text-leti-gold font-bold text-sm animate-pulse">
          Загрузка данных...
        </p>
      </div>
    )
  }

  if (error || !tourData) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z" />
          </svg>
        </div>
        <p className="text-red-500 font-bold">Ошибка загрузки: {(error as Error)?.message ?? 'Сервер недоступен'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-leti text-white rounded-xl text-sm font-medium"
        >
          Обновить страницу
        </button>
      </div>
    )
  }

  const locations = tourData as LocationMap
  const currentLocation = currentLocationId ? locations[currentLocationId] : null

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Header />

      <div className="flex-1 w-full h-full pt-[68px] relative flex flex-col">

        {/* Map view */}
        <div className={`w-full relative transition-all duration-300 ${viewMode === 'map' ? 'flex-1' : 'h-0 overflow-hidden'}`}>
          {viewMode === 'map' && (
            <>
              {/* Tab switcher */}
              <div className="absolute top-20 sm:top-6 left-1/2 -translate-x-1/2 z-[1000] flex bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full p-1 shadow-lg border border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => setMapType('campus')}
                  className={`px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-all ${
                    mapType === 'campus' ? 'bg-leti text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Карта кампуса
                </button>
                <button
                  onClick={() => setMapType('indoor')}
                  className={`px-4 sm:px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-all ${
                    mapType === 'indoor' ? 'bg-leti text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  План здания
                </button>
              </div>

              <div className="w-full h-full absolute top-0 left-0 z-0">
                <TourErrorBoundary>
                  {mapType === 'campus' ? (
                    <CampusMap tourData={locations} onSelectLocation={setLocation} />
                  ) : (
                    <IndoorMap
                      tourData={locations}
                      currentLocation={currentLocation}
                      onSelectLocation={setLocation}
                      isWidget={false}
                    />
                  )}
                </TourErrorBoundary>
              </div>
            </>
          )}
        </div>

        {/* Panorama view */}
        {viewMode === 'pano' && currentLocation && (
          <div className="flex-1 relative">
            <TourErrorBoundary>
              <TourViewer
                locationData={currentLocation}
                onNavigate={(targetId) => setLocation(targetId)}
                onOpenInfo={setActiveInfo}
              />
            </TourErrorBoundary>

            {/* Back button */}
            <button
              onClick={backToMap}
              className="absolute top-20 left-4 sm:top-6 sm:left-6 z-20 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 sm:px-5 sm:py-3 rounded-2xl shadow-lg font-bold text-gray-700 dark:text-slate-200 flex items-center gap-2 border dark:border-slate-700 transition-colors hover:bg-white dark:hover:bg-slate-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">К карте</span>
            </button>

            {/* Indoor map widget */}
            {mapType === 'indoor' && (
              <div className="absolute bottom-24 left-4 sm:bottom-6 sm:left-6 z-20 pointer-events-none">
                <div className="pointer-events-auto">
                  <IndoorMap
                    tourData={locations}
                    currentLocation={currentLocation}
                    onSelectLocation={(id) => setLocation(id)}
                    isWidget
                    onExpand={() => { backToMap(); setMapType('indoor') }}
                  />
                </div>
              </div>
            )}

            {/* Navigation minimap */}
            <div className="absolute bottom-6 right-4 sm:bottom-6 sm:right-6 z-20">
              <Minimap
                tourData={locations}
                currentLocationId={currentLocationId}
                onMapClick={(id) => setLocation(id)}
              />
            </div>

            {/* Info sheet */}
            {activeInfo && (
              <InfoSheet info={activeInfo} onClose={() => setActiveInfo(null)} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
