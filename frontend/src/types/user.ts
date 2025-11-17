export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  is_admin?: boolean
  is_producer?: boolean
  created_at: string
}