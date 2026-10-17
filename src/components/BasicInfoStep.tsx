import type { Dispatch, SetStateAction } from 'react'
import type { BriefQuestion, ClientBasicInfo } from '../types/startProject.types'

interface BasicInfoStepProps {
  question: BriefQuestion
  clientInfo: ClientBasicInfo
  setClientInfo: Dispatch<SetStateAction<ClientBasicInfo>>
  isRTL?: boolean
  shortLabel?: string
  shortLabelAr?: string
}

export default function BasicInfoStep({
  question,
  clientInfo,
  setClientInfo,
  isRTL = false,
  shortLabel,
  shortLabelAr,
}: BasicInfoStepProps) {
  return (
    <section className="flex-1 flex flex-col justify-between">
      <div className="grid grid-cols-1 lg:grid-cols-[.72fr_1.28fr] gap-10 lg:gap-[7vw] flex-1 items-start">
        <div className="lg:sticky lg:top-28">
          <div className="text-[#C5A059]/80 text-[10px] tracking-[0.58em] mb-5 font-light uppercase font-display">
            {isRTL ? question.eyebrowAr : question.eyebrow}
          </div>
          <h2
            className="text-white m-0 max-w-[620px] font-extrabold uppercase font-display"
            style={{
              fontSize: 'clamp(24px,2.8vw,38px)',
              lineHeight: isRTL ? 1.25 : 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {isRTL ? question.titleAr : question.title}
          </h2>
          {(question.description || question.descriptionAr) && (
            <p className="text-white/40 mt-6 max-w-[420px] leading-[1.9] font-light text-[12px]">
              {isRTL ? question.descriptionAr : question.description}
            </p>
          )}
        </div>

        <div className="self-start w-full">
          <div className="bg-[#0b0b0b]/60 border border-white/[0.08] p-6 sm:p-8 rounded-none">
            <label className="block mb-8">
              <span className="block text-white/70 text-[11px] tracking-[0.2em] mb-3 font-display">
                {isRTL ? 'الاسم الكامل *' : 'FULL NAME *'}
              </span>
              <input
                type="text"
                required
                placeholder={isRTL ? 'أدخل اسمك الكريم' : 'Enter client full name'}
                value={clientInfo.name}
                onChange={(e) => setClientInfo((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-white/15 focus:border-[#C5A059] outline-none text-white pb-3 transition-colors placeholder:text-white/15 font-display text-[18px]"
              />
            </label>

            <label className="block mb-8">
              <span className="block text-white/70 text-[11px] tracking-[0.2em] mb-3 font-display">
                {isRTL ? 'رقم الهاتف والتواصل *' : 'PHONE NUMBER *'}
              </span>
              <input
                type="tel"
                required
                placeholder="+966 ..."
                value={clientInfo.phone}
                onChange={(e) => setClientInfo((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-white/15 focus:border-[#C5A059] outline-none text-white pb-3 transition-colors placeholder:text-white/15 font-display text-[18px]"
              />
            </label>

            <label className="block mb-8">
              <span className="block text-white/70 text-[11px] tracking-[0.2em] mb-3 font-display">
                {isRTL ? 'البريد الإلكتروني *' : 'EMAIL ADDRESS *'}
              </span>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={clientInfo.email ?? ''}
                onChange={(e) => setClientInfo((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-white/15 focus:border-[#C5A059] outline-none text-white pb-3 transition-colors placeholder:text-white/15 font-display text-[18px]"
              />
            </label>

            <label className="block">
              <span className="block text-white/70 text-[11px] tracking-[0.2em] mb-3 font-display">
                {isRTL ? 'العنوان / المدينة والموقع *' : 'ADDRESS / LOCATION *'}
              </span>
              <input
                type="text"
                required
                placeholder={isRTL ? 'المدينة، الحي أو موقع الأرض' : 'City, neighborhood or plot location'}
                value={clientInfo.address}
                onChange={(e) => setClientInfo((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full bg-transparent border-0 border-b border-white/15 focus:border-[#C5A059] outline-none text-white pb-3 transition-colors placeholder:text-white/15 font-display text-[18px]"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-5 mt-10 pt-6 border-t border-white/[0.06]">
        <div className="text-white/20 text-[9px] tracking-[0.4em] hidden sm:block uppercase font-display">
          {isRTL ? shortLabelAr : shortLabel} / {isRTL ? 'بيانات العميل' : 'CLIENT INFO'}
        </div>
      </div>
    </section>
  )
}
