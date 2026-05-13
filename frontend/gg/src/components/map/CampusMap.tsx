import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import type { LocationMap } from '@/types/location'

// Fix default Leaflet icons in Vite
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

interface CampusMapProps {
  tourData: LocationMap
  onSelectLocation: (id: string) => void
}

const MAP_CENTER: [number, number] = [59.9715, 30.321]

export function CampusMap({ tourData, onSelectLocation }: CampusMapProps) {
  return (
    <div className="w-full h-full relative z-0">
      <MapContainer center={MAP_CENTER} zoom={17} className="w-full h-full z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {Object.values(tourData).map((loc) => (
          <Marker key={loc.id} position={loc.coordinates}>
            <Popup>
              <div className="text-center p-1 min-w-[160px]">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">{loc.name}</h3>
                <button
                  onClick={() => onSelectLocation(loc.id)}
                  className="w-full bg-[#05336e] hover:bg-[#042450] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md border-none cursor-pointer"
                >
                  Открыть панораму
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
