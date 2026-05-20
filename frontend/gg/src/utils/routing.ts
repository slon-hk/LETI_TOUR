import type { LocationMap } from '@/types/location'

/** Build undirected adjacency graph from nav markers. */
export function buildNavGraph(locations: LocationMap): Record<string, string[]> {
  const graph: Record<string, string[]> = {}
  for (const loc of Object.values(locations)) {
    if (!graph[loc.id]) graph[loc.id] = []
    for (const marker of loc.markers) {
      if (marker.type === 'nav' && marker.target) {
        graph[loc.id].push(marker.target)
        if (!graph[marker.target]) graph[marker.target] = []
        if (!graph[marker.target].includes(loc.id)) {
          graph[marker.target].push(loc.id)
        }
      }
    }
  }
  return graph
}

/** BFS shortest path between two location ids. Returns null if unreachable. */
export function bfsPath(
  graph: Record<string, string[]>,
  start: string,
  end: string,
): string[] | null {
  if (start === end) return [start]
  const queue: string[][] = [[start]]
  const visited = new Set<string>([start])
  while (queue.length) {
    const path = queue.shift()!
    const node = path[path.length - 1]
    for (const neighbor of graph[node] ?? []) {
      if (!visited.has(neighbor)) {
        const next = [...path, neighbor]
        if (neighbor === end) return next
        visited.add(neighbor)
        queue.push(next)
      }
    }
  }
  return null
}
