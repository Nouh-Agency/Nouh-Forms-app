import { useState, type Dispatch, type SetStateAction } from 'react'
import type { BriefDisciplineConfig, ClientBasicInfo } from '../types/startProject.types'
import { generateClientDossierPdf } from '../utils/pdfGenerator'
import { ArrowUpRightIcon } from './Icons'

interface SummaryStepProps {
  config: BriefDisciplineConfig
  answers: Record<string, string[]>
  clientInfo: ClientBasicInfo
  setClientInfo: Dispatch<SetStateAction<ClientBasicInfo>>
  submitBrief: () => void
  isRTL?: boolean
  onSaveProject?: () => Promise<void>
}

export default function SummaryStep({
  config,
  answers,
  clientInfo,
  setClientInfo,
  isRTL = false,
  onSaveProject,
}: SummaryStepProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      if (onSaveProject) {
        await onSaveProject()
      }

      const pdfBlob = await generateClientDossierPdf(config, answers, clientInfo, isRTL)
      const fileName = clientInfo.name.trim()
        ? `${isRTL ? 'ملف العميل' : 'Client Dossier'} - ${clientInfo.name.trim()}.pdf`
        : `${isRTL ? 'ملف العميل' : 'Client Dossier'}.pdf`

      const downloadUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)

      setSuccessMessage(
        isRTL
          ? 'تم حفظ المشروع وتصدير ملف العميل بنجاح!'
          : 'Project saved and dossier exported successfully!'
      )
    } catch {
      setErrorMessage(
        isRTL
          ? 'تعذر حفظ المشروع في السيرفر، يرجى المحاولة مرة أخرى.'
          : 'Failed to save project to server, please try again.'
      )
    } finally {
      setIsExporting(false)
    }
  }


  return (
    <section className="flex-1 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-12 lg:gap-[6vw] items-start">
        <div>
          <div className="text-[#C5A059]/80 text-[10px] tracking-[0.58em] mb-4 font-light uppercase font-display">
            {isRTL ? '٠٦ / ملف العميل والملخص' : '06 / CLIENT DOSSIER'}
          </div>
          <h2
            className="text-white m-0 font-extrabold font-display"
            style={{ fontSize: 'clamp(32px,4vw,62px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
          >
            <span>{isRTL ? 'ملف العميل: ' : 'DOSSIER: '}</span>
            <span className="text-[#C5A059] block sm:inline">{clientInfo.name || (isRTL ? 'عميل جديد' : 'New Client')}</span>
          </h2>

          <div className="mt-8 p-5 bg-[#0b0b0b] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <div className="text-white/30 text-[9px] tracking-[0.2em] font-display uppercase mb-1">
                {isRTL ? 'الاسم' : 'NAME'}
              </div>
              <div className="text-white text-[13px] font-medium font-display">
                {clientInfo.name || '—'}
              </div>
            </div>
            <div>
              <div className="text-white/30 text-[9px] tracking-[0.2em] font-display uppercase mb-1">
                {isRTL ? 'رقم الهاتف' : 'PHONE'}
              </div>
              <div className="text-white text-[13px] font-medium font-display">
                {clientInfo.phone || '—'}
              </div>
            </div>
            <div>
              <div className="text-white/30 text-[9px] tracking-[0.2em] font-display uppercase mb-1">
                {isRTL ? 'البريد الإلكتروني' : 'EMAIL'}
              </div>
              <div className="text-white text-[13px] font-medium font-display truncate">
                {clientInfo.email || '—'}
              </div>
            </div>
            <div>
              <div className="text-white/30 text-[9px] tracking-[0.2em] font-display uppercase mb-1">
                {isRTL ? 'العنوان' : 'LOCATION'}
              </div>
              <div className="text-white text-[13px] font-medium font-display">
                {clientInfo.address || '—'}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/[0.08]">
            <div className="py-4 border-b border-white/[0.08] grid grid-cols-[130px_1fr] sm:grid-cols-[180px_1fr] gap-4">
              <span className="text-white/50 text-[11px] tracking-[0.15em] leading-relaxed uppercase font-display">
                {isRTL ? 'القسم الهندسي' : 'DISCIPLINE'}
              </span>
              <span className="text-[#C5A059] text-[13px] tracking-[0.1em] leading-relaxed font-semibold font-display">
                {isRTL ? config.labelAr : config.label}
              </span>
            </div>
            {config.questions
              .filter((q) => q.mode !== 'basic_info')
              .map((q) => {
                const qSelected = (answers[q.id] ?? []).join(' / ') || '—'
                return (
                  <div
                    key={q.id}
                    className="py-4 border-b border-white/[0.08] grid grid-cols-[130px_1fr] sm:grid-cols-[180px_1fr] gap-4"
                  >
                    <span className="text-white/50 text-[11px] tracking-[0.15em] leading-relaxed uppercase font-display">
                      {isRTL ? q.titleAr : q.title}
                    </span>
                    <span className="text-white text-[13px] tracking-[0.1em] leading-relaxed font-medium font-display">
                      {qSelected}
                    </span>
                  </div>
                )
              })}
          </div>


        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleDownloadPdf()
          }}
          className="lg:pt-2"
        >
          <div className="text-white/70 text-[11px] tracking-[0.18em] mb-8 font-medium uppercase font-display">
            {isRTL ? 'ملاحظات إضافية واعتماد الملف' : 'ADDITIONAL NOTES & DISPATCH'}
          </div>

          <label className="block mb-8">
            <span className="block text-white/70 text-[11px] tracking-[0.18em] mb-3 font-medium font-display">
              {isRTL ? 'ملاحظات أو متطلبات خاصة' : 'ADDITIONAL SPECIFICATIONS'}
            </span>
            <textarea
              rows={5}
              value={clientInfo.note}
              onChange={(e) => setClientInfo((prev) => ({ ...prev, note: e.target.value }))}
              placeholder={isRTL ? 'أي تفاصيل عن المساحة، الاشتراطات أو الأفكار الإضافية...' : 'Any extra architectural guidelines, budget limits or details...'}
              className="w-full resize-none bg-transparent border-0 border-b border-white/15 focus:border-[#C5A059] outline-none text-white/80 pb-3 placeholder:text-white/15 transition-colors font-light text-[13px] leading-[1.8] font-display"
            />
          </label>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-display">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-display">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isExporting}
            className="group w-full bg-transparent border-0 p-0 flex items-center justify-between gap-6 cursor-pointer"
            style={{ cursor: isExporting ? 'wait' : 'pointer' }}
          >
            <span
              className="font-bold transition-colors font-display text-white group-hover:text-[#C5A059]"
              style={{
                fontSize: 'clamp(20px,2.5vw,34px)',
                lineHeight: 1,
              }}
            >
              {isExporting
                ? isRTL
                  ? 'جاري تصدير الملف...'
                  : 'GENERATING PDF...'
                : isRTL
                  ? 'حفظ وتصدير ملف العميل (PDF)'
                  : 'SAVE & EXPORT DOSSIER (PDF)'}
            </span>
            <div className="flex-1 h-px transition-colors bg-[#C5A059]/65" />
            <ArrowUpRightIcon
              className={`w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 text-[#C5A059] ${isRTL ? 'scale-x-[-1]' : ''}`}
            />
          </button>
        </form>
      </div>
    </section>
  )
}
