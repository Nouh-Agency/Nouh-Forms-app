import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { QuestionnaireQuestion, QuestionnaireAnswerValue } from '../types/questionnaire.types'
import { fetchProjectQuestionnaire } from '../api/questionnaireApi'
import { useSubmitQuestionnaireAnswersMutation } from '../queries/useSubmitQuestionnaireAnswersMutation'
import QuestionnaireStep from '../components/QuestionnaireStep'
import { useWizard } from '../context/WizardContext'

export default function QuestionnairePage() {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const {
    savedProject,
    questionnaireAnswers,
    setQuestionnaireAnswers,
    clearCompletedWizard,
  } = useWizard()

  const numProjectId = paramProjectId ? Number(paramProjectId) : savedProject?.id ?? 0

  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFinishedSuccessfully, setIsFinishedSuccessfully] = useState(false)

  const submitAnswersMutation = useSubmitQuestionnaireAnswersMutation()

  useEffect(() => {
    if (!numProjectId || isNaN(numProjectId)) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    fetchProjectQuestionnaire(numProjectId)
      .then((data) => {
        if (isMounted) {
          setQuestions(data)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [numProjectId])

  const isMatchingProject = Boolean(savedProject?.id && savedProject.id === numProjectId)

  const sanitizedInitialAnswers = (() => {
    if (!isMatchingProject || !questionnaireAnswers) return {}
    const validQuestionIds = new Set(questions.map((q) => q.id))
    const result: Record<number, string | string[]> = {}
    Object.entries(questionnaireAnswers).forEach(([idStr, val]) => {
      const idNum = Number(idStr)
      if (validQuestionIds.has(idNum) && val !== undefined && val !== null && val !== '') {
        result[idNum] = val
      }
    })
    return result
  })()

  const handleAnswersChange = (updatedAnswers: Record<number, string | string[]>) => {
    if (isMatchingProject) {
      queueMicrotask(() => {
        setQuestionnaireAnswers(updatedAnswers)
      })
    }
  }

  const handleFinish = async (formattedAnswers: Record<string, QuestionnaireAnswerValue>) => {
    if (!numProjectId) return
    await submitAnswersMutation.mutateAsync({
      projectId: numProjectId,
      answers: formattedAnswers,
    })
    setIsFinishedSuccessfully(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (isFinishedSuccessfully) {
      clearCompletedWizard()
      navigate('/start-project/discipline')
    } else {
      navigate('/start-project/summary')
    }
  }

  if (!numProjectId) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-red-400 text-sm font-display mb-4">
            لم يتم العثور على مشروع محدد للانتقال إلى الاستبيان.
          </div>
          <button
            onClick={() => navigate('/start-project/summary')}
            className="px-4 py-2 bg-[#C5A059] text-black font-semibold text-xs tracking-wider font-display uppercase cursor-pointer"
          >
            العودة للملخص
          </button>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-[#D4B06A] text-sm tracking-[0.2em] font-display">
            جاري تحميل أسئلة الاستبيان...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen bg-[#080808] text-white p-[5vw]">
      <QuestionnaireStep
        questions={questions}
        projectName={savedProject?.name}
        projectId={numProjectId}
        isRTL={true}
        initialAnswers={sanitizedInitialAnswers}
        onAnswersChange={handleAnswersChange}
        onFinish={handleFinish}
        onBack={handleBack}
      />

      {isFinishedSuccessfully && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0b0b0b]/85 backdrop-blur-xl border border-[#C5A059]/40 p-8 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />

            <div className="w-16 h-16 mx-auto rounded-full bg-[#C5A059]/15 border border-[#C5A059] flex items-center justify-center text-[#C5A059] mb-6 shadow-[0_0_25px_rgba(197,160,89,0.25)]">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <div className="inline-block px-3.5 py-1 mb-4 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-medium tracking-[0.2em] font-display uppercase">
              {savedProject?.name ? `${savedProject.name} — #${numProjectId}` : `المشروع #${numProjectId}`}
            </div>

            <h2 className="text-white text-2xl sm:text-3xl font-extrabold font-display mb-4">
              تم استلام وحفظ إجابات الاستبيان بنجاح
            </h2>

            <p className="text-white/60 text-sm font-light leading-relaxed font-display max-w-lg mx-auto mb-10">
              شكراً لك! تم تسجيل جميع تفاصيل ومرفقات استبيان المشروع بنجاح في قاعدة بيانات وكالة نوح، وسيقوم فريق العمل بمراجعة المتطلبات والتواصل معك مباشرة.
            </p>

            <div className="bg-[#111111]/75 backdrop-blur-md border border-white/[0.08] p-6 text-right mb-4">
              <h4 className="text-[#C5A059] text-xs font-bold font-display uppercase tracking-wider mb-2">
                الخطوة التالية (اختياري)
              </h4>
              <p className="text-white/80 text-sm font-display mb-6">
                هل ترغب في إنهاء هذه الجلسة والعودة للبداية لبدء مشروع جديد؟
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    clearCompletedWizard()
                    navigate('/start-project/discipline')
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#C5A059] text-black font-bold text-xs tracking-wider font-display uppercase hover:bg-[#d4b06a] transition-all cursor-pointer shadow-lg"
                >
                  نعم، العودة للبداية لبدء مشروع جديد
                </button>
                <button
                  type="button"
                  onClick={() => setIsFinishedSuccessfully(false)}
                  className="w-full sm:w-auto px-5 py-3 bg-transparent border border-white/20 text-white/70 hover:text-white font-medium text-xs font-display transition-colors cursor-pointer"
                >
                  الاحتفاظ بالملخص
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
