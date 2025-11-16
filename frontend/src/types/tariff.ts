export interface TariffPlan {
  id: string
  code: string
  name: string
  description: string
  price: number
  original_price?: number  // ← исправлено с originalPrice
  deadline_days: number    // ← исправлено с deadlineDays
  rounds: number
  has_questionnaire: boolean  // ← исправлено с hasQuestionnaire
  has_interview: boolean      // ← исправлено с hasInterview
  features: string[]
  badge?: string
  popular: boolean
  is_active: boolean         // ← исправлено с isActive
  sort_order: number         // ← исправлено с sortOrder
  created_at: string         // ← исправлено с createdAt
  updated_at: string         // ← исправлено с updatedAt
}

export interface TariffListResponse {
  tariffs: TariffPlan[]
}

export interface TariffCreate {
  code: string
  name: string
  description: string
  price: number
  original_price?: number
  deadline_days: number
  rounds: number
  has_questionnaire: boolean
  has_interview: boolean
  features: string[]
  badge?: string
  popular: boolean
  is_active: boolean
  sort_order: number
}

export interface TariffUpdate {
  name?: string
  description?: string
  price?: number
  original_price?: number
  deadline_days?: number
  rounds?: number
  has_questionnaire?: boolean
  has_interview?: boolean
  features?: string[]
  badge?: string
  popular?: boolean
  is_active?: boolean
  sort_order?: number
}