export interface Position2D {
  x: number
  y: number
}

export interface Position3D {
  yaw: string
  pitch: string
}

export interface MarkerSize {
  width: number
  height: number
}

export interface Marker {
  id: string
  position: Position3D
  type: 'nav' | 'info' | string
  image?: string
  size?: MarkerSize
  anchor?: string
  tooltip?: string
  target?: string
  title?: string
  text?: string
  audio?: string
  video?: string
  model_3d?: string
}

export interface Location {
  id: string
  name: string
  corpus: string
  floor: number
  coordinates: [number, number]
  indoorPosition: Position2D
  overviewPosition: Position2D | null
  panorama: string
  description: string
  markers: Marker[]
}

export type LocationMap = Record<string, Location>
