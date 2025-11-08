export interface Track {
  id: string
  order_id: string
  title?: string
  suno_id?: string
  preview_url?: string
  full_url?: string
  duration?: number
  is_paid: boolean
  status: string
  created_at: string
}

