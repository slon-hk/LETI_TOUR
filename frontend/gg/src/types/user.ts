export type Role = 'superadmin' | 'editor'

export interface User {
  id: number
  username: string
  role: Role
  is_active: boolean
  created_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AccessToken {
  access_token: string
  token_type: string
}
