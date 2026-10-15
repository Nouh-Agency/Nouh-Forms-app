export interface CreateProjectPayload {
  client_id: number
  department_id: number
  project_category_id: number
  project_type_id: number
  design_style_id: number
  project_name: string
  notes?: string
}

export interface ProjectResponse {
  id: number
  client_id: number
  department_id: number
  project_category_id: number
  project_type_id: number
  design_style_id: number
  project_name: string
  notes?: string
  created_at?: string
  updated_at?: string
}
