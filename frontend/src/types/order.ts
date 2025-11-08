import { Track } from './track'

export interface Order {
  id: string
  user_id: string
  theme: string
  genre: string
  recipient_name: string
  occasion?: string
  details?: string
  preferences?: Record<string, any>
  status: string
  interview_link?: string
  estimated_time?: string
  created_at: string
  updated_at: string
}

export interface OrderCreate {
  theme: string
  genre: string
  recipient_name: string
  occasion?: string
  details?: string
  preferences?: Record<string, any>
}

export interface OrderDetail extends Order {
  tracks: Track[]
}

