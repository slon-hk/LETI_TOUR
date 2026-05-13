import { useEffect, useRef, useState } from 'react'
import type { ActiveInfo } from '@/store/tourStore'

interface InfoSheetProps {
  info: ActiveInfo
  onClose: () => void
}

function getEmbedUrl(url: string): string {
  if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/')
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/')
  return url
}

export function InfoSheet({ info, onClose }: InfoSheetProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [info])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      void audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-slate-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
            {info.title ?? 'Информация об экспонате'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-5">
          {info.model_3d && (
            <div className="w-full h-72 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
              {/* @ts-expect-error – model-viewer is a custom element */}
              <model-viewer
                src={info.model_3d}
                alt="3D модель"
                auto-rotate
                camera-controls
                ar
                style={{ width: '100%', height: '100%' }}
              />
              <div className="absolute bottom-3 right-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-leti uppercase tracking-widest">
                3D View
              </div>
            </div>
          )}

          {info.video && (
            <div className="aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(info.video)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Видео"
              />
            </div>
          )}

          {info.image && !info.model_3d && (
            <img
              src={info.image}
              alt="Превью"
              className="w-full h-auto rounded-2xl shadow-md border border-slate-100 dark:border-slate-800"
            />
          )}

          {info.text && (
            <p className="text-gray-600 dark:text-slate-300 text-base leading-relaxed">
              {info.text}
            </p>
          )}

          {info.audio && (
            <div className="bg-blue-50 dark:bg-slate-800/50 p-5 rounded-2xl flex items-center gap-5 border border-blue-100 dark:border-slate-700">
              <audio ref={audioRef} src={info.audio} onEnded={() => setIsPlaying(false)} className="hidden" />
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
                className="bg-leti-gold text-white w-14 h-14 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-leti-gold/20 flex-shrink-0"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div>
                <div className="text-sm font-bold text-leti dark:text-blue-300">Аудиогид ЛЭТИ</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Слушать историю экспоната</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
