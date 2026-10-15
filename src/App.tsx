import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import StartProjectPage from './pages/StartProjectPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StartProjectPage />
    </QueryClientProvider>
  )
}

