import { Button } from '@/components/ui/Button'
import { useDeleteLocation, useLocationsList } from '@/hooks/useLocations'
import type { Location } from '@/types/location'

interface LocationTableProps {
  onEdit: (loc: Location) => void
  onAdd: () => void
}

export function LocationTable({ onEdit, onAdd }: LocationTableProps) {
  const { data: locations = [], isLoading } = useLocationsList()
  const deleteMutation = useDeleteLocation()

  const handleDelete = async (loc: Location) => {
    if (!window.confirm(`Удалить «${loc.name || loc.id}»?`)) return
    await deleteMutation.mutateAsync(loc.id)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Управление локациями</h1>
        <Button onClick={onAdd} size="lg">+ Добавить локацию</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="p-6">ID</th>
                <th className="p-6">Название</th>
                <th className="p-6">Корпус / Этаж</th>
                <th className="p-6 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {locations.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Локации не добавлены
                  </td>
                </tr>
              )}
              {locations.map((loc) => (
                <tr key={loc.id} className="border-t border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="p-6 font-mono text-xs text-slate-400">{loc.id}</td>
                  <td className="p-6 font-bold text-white">{loc.name}</td>
                  <td className="p-6 text-slate-400 text-sm">
                    {loc.corpus} / {loc.floor} эт.
                  </td>
                  <td className="p-6 text-right flex justify-end gap-4">
                    <button
                      onClick={() => onEdit(loc)}
                      className="text-leti-gold font-bold hover:text-yellow-400 transition-colors"
                    >
                      Правка
                    </button>
                    <button
                      onClick={() => void handleDelete(loc)}
                      disabled={deleteMutation.isPending}
                      className="text-red-500/70 hover:text-red-400 font-bold transition-colors disabled:opacity-40"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
