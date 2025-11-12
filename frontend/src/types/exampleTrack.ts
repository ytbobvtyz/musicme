export interface ExampleTrack {
    id: string
    title: string
    theme_id: string
    genre_id: string
    description?: string
    audio_filename?: string
    audio_size?: number
    audio_mimetype?: string
    is_active: boolean
    created_at: string
    theme?: {
      id: string
      name: string
    }
    genre?: {
      id: string
      name: string
    }
  }
  
  export interface ExampleTrackCreate {
    title: string
    theme_id: string
    genre_id: string
    description?: string
  }