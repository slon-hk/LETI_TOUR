import { useEffect, useRef, useState } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import type { Location, Marker } from '@/types/location'
import type { ActiveInfo } from '@/store/tourStore'
import { PanoSkeleton } from '@/components/ui/Skeleton'

interface TourViewerProps {
  locationData: Location
  onNavigate: (targetId: string) => void
  onOpenInfo: (info: ActiveInfo) => void
}

function normalizeUrl(url: string): string {
  return url.replace(/^https?:\/\/[\w.:]+(?::\d+)?(?=\/)/, '')
}

const NAV_HTML = `<div style="width:42px;height:42px;border-radius:50%;background:rgba(255,200,0,0.92);display:flex;align-items:center;justify-content:center;border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 3px 10px rgba(0,0,0,0.45);cursor:pointer"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2 4.5 20.3l.7.7L12 18l6.8 3 .7-.7z"/></svg></div>`
const INFO_HTML = `<div style="width:38px;height:38px;border-radius:50%;background:rgba(30,120,255,0.92);display:flex;align-items:center;justify-content:center;border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 3px 10px rgba(0,0,0,0.45);cursor:pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div>`

function toMarkerConfig(m: Marker): object {
  const base = { id: m.id, position: m.position, tooltip: m.tooltip ?? undefined, anchor: m.anchor ?? 'center center' }
  if (m.image) return { ...base, image: m.image, size: m.size ?? { width: 40, height: 40 } }
  return { ...base, html: m.type === 'nav' ? NAV_HTML : INFO_HTML }
}

export function TourViewer({ locationData, onNavigate, onOpenInfo }: TourViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const mpRef = useRef<MarkersPlugin | null>(null)
  const isReadyRef = useRef(false)
  // Keep latest callbacks and data in refs so event listeners never go stale
  const locationDataRef = useRef(locationData)
  const onNavigateRef = useRef(onNavigate)
  const onOpenInfoRef = useRef(onOpenInfo)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => { locationDataRef.current = locationData }, [locationData])
  useEffect(() => { onNavigateRef.current = onNavigate }, [onNavigate])
  useEffect(() => { onOpenInfoRef.current = onOpenInfo }, [onOpenInfo])

  // Create viewer once on mount
  useEffect(() => {
    if (!containerRef.current) return

    const viewer = new Viewer({
      container: containerRef.current,
      panorama: normalizeUrl(locationDataRef.current.panorama),
      plugins: [[MarkersPlugin, {}]],
      navbar: false,
      mousewheel: true,
      touchmoveTwoFingers: false,
    } as any)

    viewerRef.current = viewer

    viewer.addEventListener('ready', () => {
      const mp = viewer.getPlugin(MarkersPlugin) as MarkersPlugin
      mpRef.current = mp

      if (mp) {
        mp.setMarkers(locationDataRef.current.markers.map(toMarkerConfig) as any[])
        mp.addEventListener('select-marker', ({ marker }: any) => {
          const data = locationDataRef.current.markers.find((m) => m.id === marker.id)
          if (!data) return
          if (data.type === 'nav' && data.target) {
            void viewer.animate({ yaw: data.position.yaw, pitch: data.position.pitch, zoom: 100, speed: '3rpm' })
              .then(() => onNavigateRef.current(data.target!))
          } else {
            onOpenInfoRef.current({
              title: data.title ?? data.tooltip,
              text: data.text ?? undefined,
              audio: data.audio ?? undefined,
              video: data.video ?? undefined,
              model_3d: data.model_3d ?? undefined,
            })
          }
        })
      }

      isReadyRef.current = true
      setIsLoading(false)
    }, { once: true } as any)

    return () => {
      isReadyRef.current = false
      viewer.destroy()
      viewerRef.current = null
      mpRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update panorama + markers when location changes (after initial mount)
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer || !isReadyRef.current) return

    setIsLoading(true)
    void viewer.setPanorama(normalizeUrl(locationData.panorama)).then(() => {
      const mp = mpRef.current
      if (mp) {
        mp.clearMarkers()
        mp.setMarkers(locationData.markers.map(toMarkerConfig) as any[])
      }
      setIsLoading(false)
    })
  }, [locationData])

  return (
    <div className="w-full h-full absolute top-0 left-0 z-0">
      {isLoading && (
        <div className="absolute inset-0 z-10">
          <PanoSkeleton />
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
