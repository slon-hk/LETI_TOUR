interface SkeletonProps {
  className?: string
  variant?: 'rect' | 'circle' | 'text'
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${
        variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-xl'
      } ${className}`}
    />
  )
}

export function PanoSkeleton() {
  return (
    <div className="w-full h-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-leti-gold/30 border-t-leti-gold rounded-full animate-spin" />
        <span className="text-slate-400 text-sm font-medium">Загрузка панорамы...</span>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 space-y-3 shadow">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
