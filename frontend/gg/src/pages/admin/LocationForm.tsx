import { useEffect, useRef, useState } from 'react'
import { Viewer } from '@photo-sphere-viewer/core'
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin'
import '@photo-sphere-viewer/core/index.css'
import '@photo-sphere-viewer/markers-plugin/index.css'
import { Button } from '@/components/ui/Button'
import { useCreateLocation, useUpdateLocation } from '@/hooks/useLocations'
import { uploadFile } from '@/api/uploads'
import type { Location, Marker, Position2D } from '@/types/location'

const LETI_STRUCTURE: Record<string, number[]> = {
  '1_2': [1, 2, 3, 4],
  '3':   [1, 2, 3, 4],
  '4':   [1, 2, 3, 4, 5],
  '5':   [1, 2, 3, 4, 5, 6],
  '7':   [1, 2, 3, 4],
}

const NAV_HTML = `<div style="width:42px;height:42px;border-radius:50%;background:rgba(255,200,0,0.92);display:flex;align-items:center;justify-content:center;border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 3px 10px rgba(0,0,0,0.45);cursor:pointer"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2 4.5 20.3l.7.7L12 18l6.8 3 .7-.7z"/></svg></div>`
const INFO_HTML = `<div style="width:38px;height:38px;border-radius:50%;background:rgba(30,120,255,0.92);display:flex;align-items:center;justify-content:center;border:2.5px solid rgba(255,255,255,0.85);box-shadow:0 3px 10px rgba(0,0,0,0.45);cursor:pointer"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div>`
const TEMP_HTML = `<div style="width:44px;height:44px;border-radius:50%;background:rgba(255,215,0,0.35);border:3px solid #ffd700;box-shadow:0 0 14px rgba(255,215,0,0.7);cursor:pointer"></div>`

function toMarkerConfig(m: Marker): object {
  const base = { id: m.id, position: m.position, tooltip: m.tooltip ?? m.title ?? m.id, anchor: 'center center' }
  if (m.image) return { ...base, image: m.image, size: m.size ?? { width: 40, height: 40 } }
  return { ...base, html: m.type === 'nav' ? NAV_HTML : INFO_HTML }
}

interface FormState {
  id: string
  name: string
  corpus: string
  floor: number
  panorama: string
  description: string
  coordinates: string
  indoorPosition: string
  overviewPosition: string
  markers: string
}

const defaultForm = (): FormState => ({
  id: '',
  name: '',
  corpus: '1_2',
  floor: 1,
  panorama: '',
  description: '',
  coordinates: '[59.9714, 30.3209]',
  indoorPosition: '{"x":50,"y":50}',
  overviewPosition: 'null',
  markers: '[]',
})

function safeParse<T>(s: string): T | null {
  try { return JSON.parse(s) as T } catch { return null }
}

interface LocationFormProps {
  initial?: Location
  onCancel: () => void
  onSuccess: () => void
}

export function LocationForm({ initial, onCancel, onSuccess }: LocationFormProps) {
  const [form, setForm] = useState<FormState>(() => {
    if (!initial) return defaultForm()
    return {
      id: initial.id,
      name: initial.name,
      corpus: initial.corpus,
      floor: initial.floor,
      panorama: initial.panorama,
      description: initial.description,
      coordinates: JSON.stringify(initial.coordinates),
      indoorPosition: JSON.stringify(initial.indoorPosition),
      overviewPosition: JSON.stringify(initial.overviewPosition),
      markers: JSON.stringify(initial.markers, null, 2),
    }
  })
  const [tempMarker, setTempMarker] = useState<Partial<Marker> | null>(null)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const createMutation = useCreateLocation()
  const updateMutation = useUpdateLocation()
  const isSaving = createMutation.isPending || updateMutation.isPending

  // PSV refs
  const panoContainerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const mpRef = useRef<MarkersPlugin | null>(null)
  const isReadyRef = useRef(false)
  // Keep latest form.markers accessible in PSV event listener without stale closure
  const markersJsonRef = useRef(form.markers)
  useEffect(() => { markersJsonRef.current = form.markers }, [form.markers])

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  // Init / reinit PSV when panorama URL changes
  useEffect(() => {
    if (!panoContainerRef.current || !form.panorama) return

    isReadyRef.current = false
    if (viewerRef.current) {
      viewerRef.current.destroy()
      viewerRef.current = null
      mpRef.current = null
    }

    const viewer = new Viewer({
      container: panoContainerRef.current,
      panorama: form.panorama,
      plugins: [[MarkersPlugin, {}]],
      navbar: false,
      mousewheel: true,
      touchmoveTwoFingers: false,
    } as any)

    viewerRef.current = viewer

    viewer.addEventListener('ready', () => {
      const mp = viewer.getPlugin(MarkersPlugin) as MarkersPlugin
      mpRef.current = mp
      isReadyRef.current = true

      const existing = safeParse<Marker[]>(markersJsonRef.current) ?? []
      if (mp && existing.length) mp.setMarkers(existing.map(toMarkerConfig) as any[])

      // Click on existing marker → select it for deletion
      mp?.addEventListener('select-marker', ({ marker }: any) => {
        setSelectedMarkerId(marker.id === '__temp__' ? null : (marker.id as string))
        setTempMarker(null)
      })
    }, { once: true } as any)

    // Click on empty panorama → create temp marker
    viewer.addEventListener('click', (e: any) => {
      if (!isReadyRef.current) return
      const yaw = ((e.data.yaw * 180) / Math.PI).toFixed(2) + 'deg'
      const pitch = ((e.data.pitch * 180) / Math.PI).toFixed(2) + 'deg'
      setSelectedMarkerId(null)
      setTempMarker({
        id: `m_${Date.now()}`,
        position: { yaw, pitch },
        type: 'info',
        tooltip: 'Новый объект',
        title: '',
        text: '',
      })
    })

    return () => {
      isReadyRef.current = false
      viewer.destroy()
      viewerRef.current = null
      mpRef.current = null
    }
  }, [form.panorama]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync existing markers to PSV when form.markers changes
  useEffect(() => {
    const mp = mpRef.current
    if (!mp || !isReadyRef.current) return
    const existing = safeParse<Marker[]>(form.markers) ?? []
    mp.clearMarkers()
    if (existing.length) mp.setMarkers(existing.map(toMarkerConfig) as any[])
  }, [form.markers])

  // Show / hide temp marker on PSV
  useEffect(() => {
    const mp = mpRef.current
    if (!mp || !isReadyRef.current) return
    if (tempMarker?.position) {
      try { mp.updateMarker({ id: '__temp__', position: tempMarker.position, html: TEMP_HTML, anchor: 'center center' } as any) }
      catch { mp.addMarker({ id: '__temp__', position: tempMarker.position, html: TEMP_HTML, anchor: 'center center' } as any) }
    } else {
      try { mp.removeMarker('__temp__') } catch { /* not present */ }
    }
  }, [tempMarker])

  const handlePanoramaUpload = async (file: File | null | undefined) => {
    if (!file) return
    setUploading(true)
    try { set({ panorama: await uploadFile(file) }) }
    finally { setUploading(false) }
  }

  const handleUpload = async (file: File | null | undefined, field: keyof Marker) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile(file)
      setTempMarker((m) => m ? { ...m, [field]: url } : m)
    } finally {
      setUploading(false)
    }
  }

  const handleAddMarker = () => {
    if (!tempMarker) return
    const existing = safeParse<Marker[]>(form.markers) ?? []
    existing.push(tempMarker as Marker)
    set({ markers: JSON.stringify(existing, null, 2) })
    setTempMarker(null)
  }

  const handleDeleteMarker = (id: string) => {
    const existing = safeParse<Marker[]>(form.markers) ?? []
    set({ markers: JSON.stringify(existing.filter((m) => m.id !== id), null, 2) })
    setSelectedMarkerId(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Location = {
      id: form.id,
      name: form.name,
      corpus: form.corpus,
      floor: Number(form.floor),
      panorama: form.panorama,
      description: form.description,
      coordinates: safeParse<[number, number]>(form.coordinates) ?? [59.9714, 30.321],
      indoorPosition: safeParse<Position2D>(form.indoorPosition) ?? { x: 50, y: 50 },
      overviewPosition: safeParse<Position2D>(form.overviewPosition),
      markers: safeParse<Marker[]>(form.markers) ?? [],
    }
    if (initial) await updateMutation.mutateAsync({ id: initial.id, payload })
    else await createMutation.mutateAsync(payload)
    onSuccess()
  }

  const indoorPos = safeParse<Position2D>(form.indoorPosition)
  const overviewPos = safeParse<Position2D>(form.overviewPosition)
  const selectedMarker = selectedMarkerId
    ? (safeParse<Marker[]>(form.markers) ?? []).find((m) => m.id === selectedMarkerId)
    : null

  return (
    <form onSubmit={(e) => void handleSave(e)} className="bg-slate-900 p-8 rounded-3xl shadow-xl space-y-8 border border-slate-800">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">{initial ? 'Редактировать' : 'Новая'} локация</h2>
        <Button type="button" variant="ghost" onClick={onCancel}>Отмена</Button>
      </div>

      {/* Basic fields */}
      <div className="grid md:grid-cols-2 gap-4">
        <input
          placeholder="ID локации (уникальный)"
          value={form.id}
          onChange={(e) => set({ id: e.target.value })}
          disabled={!!initial}
          className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold disabled:opacity-50"
        />
        <input
          placeholder="Название комнаты"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          className="p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold"
        />

        <div className="flex gap-3">
          <select
            value={form.corpus}
            onChange={(e) => set({ corpus: e.target.value, floor: 1 })}
            className="flex-1 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold"
          >
            {Object.keys(LETI_STRUCTURE).map((k) => (
              <option key={k} value={k}>{k} корпус</option>
            ))}
          </select>
          <select
            value={form.floor}
            onChange={(e) => set({ floor: Number(e.target.value) })}
            className="w-24 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold"
          >
            {(LETI_STRUCTURE[form.corpus] ?? []).map((f) => (
              <option key={f} value={f}>{f} эт.</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            placeholder="Панорама URL или /media/..."
            value={form.panorama}
            onChange={(e) => set({ panorama: e.target.value })}
            className="flex-1 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold"
          />
          <label className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm cursor-pointer transition-colors ${uploading ? 'bg-slate-700 text-slate-400' : 'bg-leti text-white hover:bg-leti/80'}`}>
            {uploading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
              </svg>
            )}
            {uploading ? 'Загрузка...' : 'Загрузить'}
            <input type="file" className="hidden" accept="image/*" disabled={uploading}
              onChange={(e) => void handlePanoramaUpload(e.target.files?.[0])} />
          </label>
        </div>

        <textarea
          placeholder="Описание"
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          rows={2}
          className="md:col-span-2 p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold resize-none"
        />
      </div>

      {/* Panorama editor */}
      {form.panorama && (
        <div className="space-y-3">
          <h3 className="text-white font-bold">
            Редактор панорамы
            <span className="ml-2 text-slate-400 font-normal text-sm">— кликни на пустое место, чтобы добавить маркер; на маркер — чтобы удалить</span>
          </h3>
          <div className="h-[400px] rounded-3xl overflow-hidden border-2 border-slate-800 relative shadow-2xl">
            <div ref={panoContainerRef} className="w-full h-full" />

            {/* New marker panel */}
            {tempMarker && (
              <div className="absolute top-4 left-4 z-50 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl w-72 space-y-3 border dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-leti uppercase tracking-widest">Новая точка</span>
                  <select
                    className="bg-slate-100 dark:bg-slate-800 text-[10px] p-1 rounded font-bold dark:text-white"
                    value={tempMarker.type ?? 'info'}
                    onChange={(e) => setTempMarker((m) => m ? { ...m, type: e.target.value } : m)}
                  >
                    <option value="info">INFO</option>
                    <option value="nav">NAV</option>
                  </select>
                </div>

                {tempMarker.type === 'nav' ? (
                  <input
                    placeholder="ID целевой комнаты"
                    className="w-full border-b dark:bg-transparent dark:text-white p-2 text-sm outline-none"
                    value={tempMarker.target ?? ''}
                    onChange={(e) => setTempMarker((m) => m ? { ...m, target: e.target.value } : m)}
                  />
                ) : (
                  <>
                    <input
                      placeholder="Заголовок"
                      className="w-full border-b dark:bg-transparent dark:text-white p-2 text-sm outline-none"
                      value={tempMarker.title ?? ''}
                      onChange={(e) => setTempMarker((m) => m ? { ...m, title: e.target.value } : m)}
                    />
                    <textarea
                      placeholder="Описание..."
                      className="w-full border rounded-xl dark:bg-slate-800 dark:text-white p-3 text-xs outline-none resize-none"
                      rows={3}
                      value={tempMarker.text ?? ''}
                      onChange={(e) => setTempMarker((m) => m ? { ...m, text: e.target.value } : m)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1 cursor-pointer">
                        <span className="text-[9px] font-bold text-gray-400">Аудиогид</span>
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center text-lg">🎵</div>
                        <input type="file" className="hidden" accept=".mp3,.wav,.m4a,.ogg,.aac,.opus,.flac,audio/*"
                          onChange={(e) => void handleUpload(e.target.files?.[0], 'audio')} />
                      </label>
                      <label className="flex flex-col gap-1 cursor-pointer">
                        <span className="text-[9px] font-bold text-gray-400">3D модель</span>
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg text-center text-lg">📦</div>
                        <input type="file" className="hidden" accept=".glb,.gltf,.obj,.fbx,.stl,.dae,.ply,.usdz,.blend"
                          onChange={(e) => void handleUpload(e.target.files?.[0], 'model_3d')} />
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button type="button" size="sm" className="flex-1" onClick={handleAddMarker} loading={uploading}>
                    Добавить
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setTempMarker(null)}>
                    Отмена
                  </Button>
                </div>
              </div>
            )}

            {/* Selected marker delete panel */}
            {selectedMarker && (
              <div className="absolute top-4 right-4 z-50 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl w-64 space-y-2 border dark:border-slate-700">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Маркер</p>
                <p className="text-sm font-semibold dark:text-white truncate">
                  {selectedMarker.title || selectedMarker.tooltip || selectedMarker.id}
                </p>
                <p className="text-[10px] text-slate-400">
                  {selectedMarker.type === 'nav' ? `→ ${selectedMarker.target}` : selectedMarker.text?.slice(0, 60)}
                </p>
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button" size="sm"
                    className="flex-1 !bg-red-600 hover:!bg-red-700"
                    onClick={() => handleDeleteMarker(selectedMarker.id)}
                  >
                    Удалить
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => setSelectedMarkerId(null)}>
                    Закрыть
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Position pickers */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Позиция на общей карте</label>
          <div
            className="relative border border-slate-800 rounded-2xl overflow-hidden cursor-crosshair"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              set({ overviewPosition: JSON.stringify({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }) })
            }}
          >
            <img src="/map_all_areas.png" className="w-full dark:invert opacity-40" alt="Карта" />
            {overviewPos && (
              <div
                className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-xl pointer-events-none"
                style={{ left: `${overviewPos.x}%`, top: `${overviewPos.y}%`, transform: 'translate(-50%, -50%)' }}
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">Позиция на плане этажа</label>
          <div
            className="relative border border-slate-800 rounded-2xl overflow-hidden cursor-crosshair flex items-center justify-center min-h-[160px] bg-slate-900"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              set({ indoorPosition: JSON.stringify({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }) })
            }}
          >
            <img src={`/map_area_${form.corpus}_floor_${form.floor}.svg`} className="max-w-full dark:invert opacity-40" alt="План" />
            {indoorPos && (
              <div
                className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-xl pointer-events-none"
                style={{ left: `${indoorPos.x}%`, top: `${indoorPos.y}%`, transform: 'translate(-50%, -50%)' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* GPS */}
      <div className="space-y-2">
        <label className="text-slate-400 text-xs font-bold uppercase tracking-widest">GPS координаты (JSON)</label>
        <input
          value={form.coordinates}
          onChange={(e) => set({ coordinates: e.target.value })}
          className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-700 outline-none focus:border-leti-gold font-mono text-sm"
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" variant="secondary" size="lg" className="flex-1" loading={isSaving}>
          Сохранить
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  )
}
