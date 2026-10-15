import type { BriefDisciplineConfig } from '../types/startProject.types'
import { ArrowLeftIcon, ArrowRightIcon } from './Icons'

interface NavigationActionsProps {
  isSummary: boolean
  canContinue: boolean
  config: BriefDisciplineConfig
  step: number
  totalSteps: number
  progress: number
  goBack: () => void
  goNext: () => void
  isRTL?: boolean
  isPending?: boolean
}

export default function NavigationActions({
  isSummary,
  canContinue,
  config,
  step,
  totalSteps,
  progress,
  goBack,
  goNext,
  isRTL = false,
  isPending = false,
}: NavigationActionsProps) {
  return (
    <>
      <div className="flex items-center justify-between gap-5 mb-5">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-3 text-white/40 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer font-light font-display"
        >
          <ArrowLeftIcon className={`w-3.5 h-3.5 ${isRTL ? 'scale-x-[-1]' : ''}`} />
          <span className="text-[10px] tracking-[0.42em] uppercase">
            {isRTL ? 'رجوع' : 'BACK'}
          </span>
        </button>

        <div className="flex items-center gap-5 sm:gap-8">
          <div className="text-white/25 text-[9px] tracking-[0.42em] font-light uppercase font-display">
            {isSummary
              ? isRTL
                ? 'ملف العميل مكتمل'
                : 'BRIEF DOSSIER READY'
              : `${isRTL ? config.shortLabelAr : config.shortLabel} — ${String(step + 1).padStart(2, '0')} / ${String(totalSteps).padStart(2, '0')}`}
          </div>

          {!isSummary && (
            <button
              disabled={!canContinue || isPending}
              onClick={goNext}
              className="inline-flex items-center gap-4 bg-transparent border-0 p-0 transition-all duration-300"
              style={{ cursor: canContinue && !isPending ? 'pointer' : 'not-allowed' }}
            >
              <span
                className={`text-[10px] tracking-[0.46em] uppercase transition-colors font-display ${canContinue && !isPending ? 'text-[#D4B06A]' : 'text-white/20'}`}
              >
                {isPending ? (isRTL ? 'جاري الحفظ...' : 'SAVING...') : isRTL ? 'متابعة' : 'CONTINUE'}
              </span>
              <span
                className={`h-px transition-all duration-300 ${canContinue && !isPending ? 'bg-[#C5A059]' : 'bg-white/10'}`}
                style={{ width: canContinue && !isPending ? 48 : 22 }}
              />
              <ArrowRightIcon
                className={`w-3.5 h-3.5 transition-colors ${canContinue && !isPending ? 'text-[#C5A059]' : 'text-white/15'} ${isRTL ? 'scale-x-[-1]' : ''}`}
              />
            </button>
          )}
        </div>
      </div>

      <div className="h-px bg-white/[0.08] relative overflow-hidden mb-10 sm:mb-12">
        <div
          className="absolute top-0 h-full bg-[#C5A059] transition-[width] duration-700"
          style={{ [isRTL ? 'right' : 'left']: 0, width: `${progress * 100}%` }}
        />
      </div>
    </>
  )
}
