import { useQuery } from '@tanstack/react-query'
import { fetchDepartments } from '../api/departmentsApi'

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  })
}
