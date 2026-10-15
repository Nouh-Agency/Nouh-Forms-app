import { useQuery } from '@tanstack/react-query'
import { fetchDesignStyles } from '../api/designStylesApi'

export function useDesignStylesQuery() {
  return useQuery({
    queryKey: ['design-styles'],
    queryFn: fetchDesignStyles,
  })
}
