import { useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer, Polyline } from 'react-leaflet'
import type { LocationMap } from '@/types/location'

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const userIcon = L.divIcon({
  html: `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(59,130,246,0.5)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  className: '',
})

interface CampusMapProps {
  tourData: LocationMap
  onSelectLocation: (id: string) => void
}

const MAP_CENTER: [number, number] = [59.9715, 30.321]

export function CampusMap({ tourData, onSelectLocation }: CampusMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [routePath, setRoutePath] = useState<[number, number][] | null>(null)
  const [routeTarget, setRouteTarget] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null)

  async function getLocation(): Promise<[number, number] | null> {
    if (userLocation) return userLocation
    if (!navigator.geolocation) return null
    setLocating(true)
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
          setUserLocation(coords)
          setLocating(false)
          resolve(coords)
        },
        () => {
          setLocating(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 8000 },
      )
    })
  }

  async function navigateTo(destId: string) {
    const pos = await getLocation()
    if (!pos) return
    const dest = tourData[destId]
    if (!dest) return

    setRouteTarget(destId)

    const [lat1, lon1] = pos
    const [lat2, lon2] = dest.coordinates

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/foot/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`,
      )
      const data = await res.json()
      if (data.code === 'Ok' && data.routes?.[0]) {
        setRoutePath(
          data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
          ),
        )
        setRouteInfo({
          distance: Math.round(data.routes[0].distance),
          duration: Math.round(data.routes[0].duration / 60),
        })
        return
      }
    } catch { /* fall through to straight-line fallback */ }

    setRoutePath([pos, dest.coordinates])
    setRouteInfo(null)
  }

  function clearRoute() {
    setRoutePath(null)
    setRouteTarget(null)
    setRouteInfo(null)
  }

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={MAP_CENTER} zoom={17} className="w-full h-full z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>Вы здесь</Popup>
          </Marker>
        )}

        {routePath && (
          <Polyline positions={routePath} color="#3b82f6" weight={4} opacity={0.85} />
        )}

        {Object.values(tourData).map((loc) => (
          <Marker key={loc.id} position={loc.coordinates}>
            <Popup>
              <div className="text-center p-1 min-w-[160px] flex flex-col gap-2">
                <h3 className="font-bold text-gray-900 text-sm">{loc.name}</h3>
                <button
                  onClick={() => onSelectLocation(loc.id)}
                  className="w-full bg-[#05336e] hover:bg-[#042450] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                >
                  Открыть панораму
                </button>
                <button
                  onClick={() => navigateTo(loc.id)}
                  disabled={locating}
                  className={`w-full px-4 py-2 rounded-xl text-sm font-bold transition-colors border disabled:opacity-50 ${
                    routeTarget === loc.id
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {routeTarget === loc.id ? '✓ Маршрут построен' : 'Маршрут до сюда'}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Route info pill */}
      {routeInfo && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-4 py-2 flex items-center gap-3 text-sm border border-gray-100 pointer-events-none">
          <span className="font-bold text-blue-600">
            {routeInfo.distance < 1000
              ? `${routeInfo.distance} м`
              : `${(routeInfo.distance / 1000).toFixed(1)} км`}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600">~{routeInfo.duration} мин пешком</span>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-2 items-end">
        <div className="flex gap-2">
          {routePath && (
            <button
              onClick={clearRoute}
              title="Сбросить маршрут"
              className="w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button
            onClick={() => getLocation()}
            disabled={locating}
            title="Моё местоположение"
            className={`w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center border transition-colors disabled:opacity-50 ${
              userLocation
                ? 'border-blue-300 text-blue-600 hover:bg-blue-50'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {locating ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
