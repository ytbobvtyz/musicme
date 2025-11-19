export interface RevisionComment {
  id: string
  order_id: string
  user_id: string
  comment: string
  revision_number: number
  created_at: string
  user_name?: string
  user_email?: string
}