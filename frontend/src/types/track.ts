// src/types/track.ts
export interface Track {
  id: string
  order_id: string
  title?: string
  suno_id?: string
  preview_url?: string
  full_url?: string
  audio_filename?: string
  audio_size?: number
  audio_mimetype?: string
  duration?: number
  created_at: string
  updated_at?: string
  is_preview?: boolean
  
  // Опциональные связи
  order?: {
    id: string
    recipient_name: string
    theme?: {
      id: string
      name: string
    }
    genre?: {
      id: string
      name: string
    }
    user?: {
      id: string
      email: string
      name?: string
    }
  }
  
  // Для истории доработок (будем добавлять позже)
  revision_history?: Array<{
    version: number
    comment?: string
    date: string
    changed_by: string
  }>
}

// Для создания нового трека
export interface TrackCreate {
  order_id: string
  title?: string
  audio_file?: File
  is_preview?: boolean
}

// Для обновления трека
export interface TrackUpdate {
  title?: string
  status?: string
  suno_id?: string
  preview_url?: string
  full_url?: string
  is_preview?: boolean
}