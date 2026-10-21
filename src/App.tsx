import { lazy } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { WizardProvider } from './context/WizardContext'
import StartProjectWizardLayout from './layouts/StartProjectWizardLayout'
import DisciplinePage from './pages/DisciplinePage'
import LoginPage from './pages/LoginPage'

const BasicInfoPage = lazy(() => import('./pages/BasicInfoPage'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const ProjectTypePage = lazy(() => import('./pages/ProjectTypePage'))
const DesignStylePage = lazy(() => import('./pages/DesignStylePage'))
const QuestionPage = lazy(() => import('./pages/QuestionPage'))
const SummaryPage = lazy(() => import('./pages/SummaryPage'))
const QuestionnairePage = lazy(() => import('./pages/QuestionnairePage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
})

function ProtectedRoute() {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WizardProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/start-project" element={<Navigate to="/start-project/discipline" replace />} />
              <Route element={<StartProjectWizardLayout />}>
                <Route path="/start-project/discipline" element={<DisciplinePage />} />
                <Route path="/start-project/basic-info" element={<BasicInfoPage />} />
                <Route path="/start-project/category" element={<CategoryPage />} />
                <Route path="/start-project/project-type" element={<ProjectTypePage />} />
                <Route path="/start-project/design-style" element={<DesignStylePage />} />
                <Route path="/start-project/question/:questionId" element={<QuestionPage />} />
                <Route path="/start-project/summary" element={<SummaryPage />} />
                <Route path="/start-project/questionnaire" element={<QuestionnairePage />} />
                <Route path="/start-project/questionnaire/:projectId" element={<QuestionnairePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </WizardProvider>
    </QueryClientProvider>
  )
}
