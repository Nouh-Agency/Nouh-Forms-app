import { useEffect, useState, Suspense } from 'react'
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { PROJECT_BRIEF_DISCIPLINES } from '../constants/startProjectConstants'
import NavigationActions from '../components/NavigationActions'
import RouteLoadingFallback from '../components/RouteLoadingFallback'
import RouteErrorBoundary from '../components/RouteErrorBoundary'
import { ArrowLeftIcon } from '../components/Icons'
import { useWizard } from '../context/WizardContext'
import {
  getDisciplineSteps,
  getNextStepPath,
  getPrevStepPath,
} from '../utils/wizardRoutes'
import { useCreateClientMutation } from '../queries/useCreateClientMutation'
import { useLogoutMutation } from '../queries/useLogoutMutation'
import { decodeProjectId, encodeProjectId } from '../utils/projectToken'

export default function StartProjectWizardLayout() {
  const isRTL = true
  const location = useLocation()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [draftDismissed, setDraftDismissed] = useState(false)

  const {
    discipline,
    clientInfo,
    createdClientId,
    setCreatedClientId,
    answers,
    selectedCategory,
    selectedProjectType,
    selectedDesignStyle,
    savedProject,
    hoveredImage,
    setHoveredImage,
    setCurrentPath,
    hasSavedDraft,
    discardDraft,
  } = useWizard()

  const createClientMutation = useCreateClientMutation()
  const logoutMutation = useLogoutMutation()

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } catch {
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    navigate('/login', { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setCurrentPath(location.pathname)
  }, [location.pathname, setCurrentPath])

  const pathname = location.pathname
  const isDisciplineRoute = pathname === '/start-project/discipline' || pathname === '/start-project'
  const isQuestionnaireRoute = pathname.startsWith('/start-project/questionnaire')

  if (!isDisciplineRoute && !isQuestionnaireRoute && !discipline) {
    return <Navigate to="/start-project/discipline" replace />
  }

  const currentDiscipline = discipline ?? 'architecture'
  const config = PROJECT_BRIEF_DISCIPLINES.find((d) => d.id === currentDiscipline) ?? PROJECT_BRIEF_DISCIPLINES[0]
  const stepsList = getDisciplineSteps(currentDiscipline)
  const isSummary = pathname === '/start-project/summary'

  const hasBasicInfo = Boolean(clientInfo.name.trim() && clientInfo.phone.trim())
  const hasCategory = Boolean((answers['projectType']?.length ?? 0) > 0 || selectedCategory !== null)

  if (isQuestionnaireRoute) {
    const match = pathname.match(/\/questionnaire\/([^/]+)/)
    const token = match?.[1]
    const decodedId = token ? decodeProjectId(token) : null

    if (!decodedId && !savedProject?.id) {
      return <Navigate to="/start-project/summary" replace />
    }
    if (!token && savedProject?.id) {
      return <Navigate to={`/start-project/questionnaire/${encodeProjectId(savedProject.id)}`} replace />
    }
  }

  if (!isDisciplineRoute && !isQuestionnaireRoute) {
    const isStepInDiscipline = stepsList.some((s) => s.path === pathname)
    if (!isStepInDiscipline) {
      if (!hasBasicInfo) {
        return <Navigate to="/start-project/basic-info" replace />
      }
      if (!hasCategory) {
        return <Navigate to="/start-project/category" replace />
      }
      const fallbackStep = stepsList[3]?.path ?? '/start-project/category'
      return <Navigate to={fallbackStep} replace />
    }

    if (pathname === '/start-project/category') {
      if (!hasBasicInfo) {
        return <Navigate to="/start-project/basic-info" replace />
      }
    }

    if (pathname === '/start-project/project-type') {
      if (!hasBasicInfo) return <Navigate to="/start-project/basic-info" replace />
      if (!hasCategory) return <Navigate to="/start-project/category" replace />
    }

    if (pathname === '/start-project/design-style') {
      if (!hasBasicInfo) return <Navigate to="/start-project/basic-info" replace />
      if (!hasCategory) return <Navigate to="/start-project/category" replace />
      const hasProjectType = (answers['subType']?.length ?? 0) > 0 || selectedProjectType !== null
      if (!hasProjectType) {
        return <Navigate to="/start-project/project-type" replace />
      }
    }

    if (pathname === '/start-project/question/subType') {
      if (!hasBasicInfo) return <Navigate to="/start-project/basic-info" replace />
      if (!hasCategory) return <Navigate to="/start-project/category" replace />
    }

    if (pathname === '/start-project/question/styles') {
      if (!hasBasicInfo) return <Navigate to="/start-project/basic-info" replace />
      if (!hasCategory) return <Navigate to="/start-project/category" replace />
      const hasProjectType = (answers['subType']?.length ?? 0) > 0 || selectedProjectType !== null
      if (!hasProjectType) {
        return <Navigate to="/start-project/project-type" replace />
      }
    }

    if (pathname === '/start-project/question/features') {
      if (!hasBasicInfo) return <Navigate to="/start-project/basic-info" replace />
      if (!hasCategory) return <Navigate to="/start-project/category" replace />
      const hasProjectType = (answers['subType']?.length ?? 0) > 0 || selectedProjectType !== null
      if (!hasProjectType) return <Navigate to="/start-project/project-type" replace />
    }

    if (pathname === '/start-project/question/timeline') {
      if (!hasBasicInfo) return <Navigate to="/start-project/basic-info" replace />
      if (!hasCategory) return <Navigate to="/start-project/category" replace />
      const hasProjectType = (answers['subType']?.length ?? 0) > 0 || selectedProjectType !== null
      if (!hasProjectType) return <Navigate to="/start-project/project-type" replace />
    }

    if (isSummary) {
      if (!hasBasicInfo) {
        return <Navigate to="/start-project/basic-info" replace />
      }
      if (!hasCategory) {
        return <Navigate to="/start-project/category" replace />
      }
      if (currentDiscipline === 'architecture') {
        if ((answers['subType']?.length ?? 0) === 0 && !selectedProjectType) {
          return <Navigate to="/start-project/project-type" replace />
        }
        if ((answers['style']?.length ?? 0) === 0 && !selectedDesignStyle) {
          return <Navigate to="/start-project/design-style" replace />
        }
      } else if (currentDiscipline === 'graphic' || currentDiscipline === 'technology') {
        if ((answers['subType']?.length ?? 0) === 0 && !selectedProjectType) {
          return <Navigate to="/start-project/project-type" replace />
        }
      }
    }
  }

  const currentStepIndex = stepsList.findIndex((s) => s.path === pathname)
  const safeStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0
  const totalSteps = stepsList.length - 1
  const progress = isSummary ? 1 : (safeStepIndex + 1) / (totalSteps + 1)

  let canContinue = false
  if (pathname === '/start-project/basic-info') {
    canContinue = Boolean(
      clientInfo.name.trim() &&
      clientInfo.phone.trim() &&
      (clientInfo.email ?? '').trim() &&
      clientInfo.address.trim()
    )
  } else if (pathname === '/start-project/category') {
    canContinue = (answers['projectType']?.length ?? 0) > 0
  } else if (pathname === '/start-project/project-type') {
    canContinue = (answers['subType']?.length ?? 0) > 0 || selectedProjectType !== null
  } else if (pathname === '/start-project/design-style') {
    canContinue = (answers['style']?.length ?? 0) > 0
  } else if (pathname.startsWith('/start-project/question/')) {
    const qId = pathname.replace('/start-project/question/', '')
    canContinue = (answers[qId]?.length ?? 0) > 0
  } else if (isSummary) {
    canContinue = true
  }

  const goBack = () => {
    setHoveredImage(null)
    const prev = getPrevStepPath(pathname, currentDiscipline)
    if (prev) {
      navigate(prev)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/start-project/discipline')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goNext = () => {
    if (!canContinue || createClientMutation.isPending) return

    if (pathname === '/start-project/basic-info') {
      if (createdClientId) {
        setHoveredImage(null)
        const next = getNextStepPath(pathname, currentDiscipline)
        if (next) {
          navigate(next)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        return
      }

      createClientMutation.mutate(
        {
          name: clientInfo.name.trim(),
          phone: clientInfo.phone.trim(),
          email: (clientInfo.email ?? '').trim(),
          address: clientInfo.address.trim(),
        },
        {
          onSuccess: (client) => {
            setCreatedClientId(client.id)
            setHoveredImage(null)
            const next = getNextStepPath(pathname, currentDiscipline)
            if (next) {
              navigate(next)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          },
        }
      )
      return
    }

    setHoveredImage(null)
    const next = getNextStepPath(pathname, currentDiscipline)
    if (next) {
      navigate(next)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!canContinue) return
    const nextPath = getNextStepPath(pathname, currentDiscipline)
    if (!nextPath) return

    const timer = setTimeout(() => {
      if (typeof window === 'undefined') return
      if ('connection' in navigator && (navigator as { connection?: { saveData?: boolean } }).connection?.saveData) return
      if (nextPath === '/start-project/basic-info') import('../pages/BasicInfoPage')
      else if (nextPath === '/start-project/category') import('../pages/CategoryPage')
      else if (nextPath === '/start-project/project-type') import('../pages/ProjectTypePage')
      else if (nextPath === '/start-project/design-style') import('../pages/DesignStylePage')
      else if (nextPath.startsWith('/start-project/question/')) import('../pages/QuestionPage')
      else if (nextPath === '/start-project/summary') import('../pages/SummaryPage')
      else if (nextPath.startsWith('/start-project/questionnaire')) import('../pages/QuestionnairePage')
    }, 250)

    return () => clearTimeout(timer)
  }, [canContinue, pathname, currentDiscipline])

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#080808] text-white">
      <header
        className={`fixed top-0 left-0 right-0 z-50 px-[5vw] transition-all duration-300 flex items-center justify-between pointer-events-none whitespace-nowrap ${isScrolled || isQuestionnaireRoute
            ? 'py-4 bg-[#080808]/85 backdrop-blur-md border-b border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_4px_25px_rgba(0,0,0,0.6)]'
            : 'py-5 bg-transparent border-b border-transparent'
          }`}
      >
        <div className="pointer-events-auto flex items-center gap-3 whitespace-nowrap">
          <img
            src="/logo.png"
            alt="Nouh Agency"
            className="w-7 h-7 object-contain"
          />
          <span className="text-[10px] sm:text-[11px] tracking-[0.1em] text-[#C5A059] font-medium font-display uppercase whitespace-nowrap">
            NOUH AGENCY
          </span>
          <span className="hidden sm:inline text-[9px] tracking-[0.2em] text-white/35 font-display whitespace-nowrap">
            {isRTL ? 'نظام استبيان المشاريع الهرمي' : 'FORMS & BRIEFS'}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          {isQuestionnaireRoute && (
            <button
              type="button"
              onClick={() => {
                navigate('/start-project/summary')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2.5 px-4 py-2 border border-white/20 hover:border-[#C5A059] text-white/70 hover:text-white bg-[#0b0b0b]/70 hover:bg-[#0b0b0b] transition-all cursor-pointer font-display text-[11px] tracking-wider uppercase backdrop-blur-md"
            >
              <ArrowLeftIcon className={`w-3.5 h-3.5 ${isRTL ? 'scale-x-[-1]' : ''}`} />
              <span>{isRTL ? 'رجوع للملخص' : 'Back to Summary'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 border border-white/15 hover:border-red-500/40 text-white/70 hover:text-red-400 bg-[#0b0b0b]/70 hover:bg-red-500/10 transition-all cursor-pointer font-display text-[11px] tracking-wider uppercase backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-3.5 h-3.5 ${isRTL ? 'scale-x-[-1]' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{logoutMutation.isPending ? (isRTL ? 'جاري الخروج...' : 'Logging out...') : (isRTL ? 'تسجيل الخروج' : 'Logout')}</span>
          </button>
        </div>
      </header>

      {isDisciplineRoute ? (
        <>
          {hasSavedDraft && !draftDismissed && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[90vw] max-w-xl p-4 bg-[#0e0e0e]/95 border border-[#C5A059]/40 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-right">
                <div className="text-white text-xs font-bold font-display">
                  توجد مسودة  محفوظة مسبقاً
                </div>
                <div className="text-white/50 text-[10px] font-display mt-0.5">
                  يمكنك استكمال المسودة السابقة أو البدء من جديد
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const resumePath = getDisciplineSteps(currentDiscipline)[1]?.path ?? '/start-project/basic-info'
                    navigate(resumePath)
                  }}
                  className="px-3.5 py-1.5 bg-[#C5A059] text-black font-semibold text-xs tracking-wider font-display uppercase cursor-pointer hover:bg-[#d4b06a] transition-colors"
                >
                  استكمال
                </button>
                <button
                  onClick={() => {
                    discardDraft()
                    setDraftDismissed(true)
                  }}
                  className="px-3 py-1.5 bg-transparent border border-white/20 text-white/70 hover:text-white font-medium text-xs font-display cursor-pointer transition-colors"
                >
                  بدء جديد
                </button>
              </div>
            </div>
          )}
          <RouteErrorBoundary>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Outlet />
            </Suspense>
          </RouteErrorBoundary>
        </>
      ) : isQuestionnaireRoute ? (
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
      ) : (
        <main className="relative min-h-[100svh] bg-[#080808] text-white overflow-hidden">
          {!isSummary && hoveredImage && (
            <div className="fixed inset-0 pointer-events-none z-0">
              <img
                src={hoveredImage}
                alt=""
                className="w-full h-full object-cover opacity-[0.14] scale-[1.03] transition-all duration-700"
              />
              <div className="absolute inset-0 bg-[#080808]/75" />
            </div>
          )}

          <div className="relative z-10 px-[5vw] pt-24 sm:pt-28 pb-10 min-h-[100svh] flex flex-col justify-between">
            <NavigationActions
              isSummary={isSummary}
              canContinue={canContinue}
              config={config}
              step={safeStepIndex}
              totalSteps={totalSteps}
              progress={progress}
              goBack={goBack}
              goNext={goNext}
              isRTL={isRTL}
              isPending={createClientMutation.isPending}
            />

            {createClientMutation.isError && (
              <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-display">
                {isRTL
                  ? 'تعذر حفظ بيانات العميل في السيرفر، يرجى التحقق من صحة البيانات والمحاولة مرة أخرى.'
                  : 'Failed to save client information to the server. Please check your input and try again.'}
              </div>
            )}

            <RouteErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback />}>
                <Outlet />
              </Suspense>
            </RouteErrorBoundary>
          </div>
        </main>
      )}
    </div>
  )
}
