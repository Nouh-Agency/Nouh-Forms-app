import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoginMutation } from '../queries/useLoginMutation'
import axios from 'axios'

export default function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [emailTouched, setEmailTouched] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const isPasswordValid = password.length >= 6
  const isFormValid = isEmailValid && isPasswordValid

  const emailError =
    emailTouched && !email.trim()
      ? 'البريد الإلكتروني مطلوب'
      : emailTouched && !isEmailValid
      ? 'يرجى إدخال بريد إلكتروني صحيح'
      : null

  const passwordError =
    passwordTouched && !password
      ? 'كلمة المرور مطلوبة'
      : passwordTouched && !isPasswordValid
      ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف'
      : null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEmailTouched(true)
    setPasswordTouched(true)
    setErrorMessage(null)

    if (!isFormValid) {
      return
    }

    try {
      const response = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      })

      const token =
        response.token ||
        response.access_token ||
        response.data?.token ||
        response.data?.access_token

      if (token) {
        localStorage.setItem('auth_token', token)
      }

      const user = response.user || response.data?.user
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }

      navigate('/start-project/discipline', { replace: true })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMessage =
          err.response?.data?.message ||
          (typeof err.response?.data?.error === 'string'
            ? err.response?.data?.error
            : null)

        if (
          err.response?.status === 401 ||
          err.response?.status === 422 ||
          (typeof serverMessage === 'string' &&
            (serverMessage.toLowerCase().includes('credentials do not match') ||
              serverMessage.toLowerCase().includes('invalid credentials') ||
              serverMessage.toLowerCase().includes('unauthorized')))
        ) {
          setErrorMessage('البريد الإلكتروني أو كلمة المرور خاطئة، يرجى إعادة المحاولة')
        } else {
          setErrorMessage(
            serverMessage || 'فشل تسجيل الدخول، يرجى التحقق من صحة البريد وكلمة المرور'
          )
        }
      } else if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('حدث خطأ غير متوقع أثناء تسجيل الدخول')
      }
    }
  }

  return (
    <main dir="rtl" className="relative min-h-screen bg-[#080808] text-white flex flex-col justify-between overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, black, transparent 92%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 92%)',
        }}
      />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 50% 0%, #C5A059 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <header className="relative z-10 w-full px-[5vw] py-6 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Nouh Agency"
            className="w-8 h-8 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-[11px] tracking-[0.45em] text-[#C5A059] font-medium font-display uppercase">
              NOUH AGENCY
            </span>
            <span className="text-[9px] tracking-[0.2em] text-white/35 font-display">
              نظام استبيان المشاريع الهرمي
            </span>
          </div>
        </div>
      </header>

      <section className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-[440px] bg-[#0b0b0b]/80 border border-white/[0.08] backdrop-blur-xl p-8 sm:p-10 shadow-[0_25px_70px_rgba(0,0,0,0.85)] relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent" />

          <div className="mb-8 text-center">
            <div className="inline-block text-[#C5A059] text-[10px] tracking-[0.45em] mb-2 uppercase font-display">
              بوابة الدخول / AUTHENTICATION
            </div>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold font-display uppercase tracking-tight">
              تسجيل الدخول
            </h1>
            <p className="text-white/45 text-xs font-display leading-relaxed mt-2">
              أدخل بيانات حسابك للمتابعة إلى اختيار القسم وبدء المشروع
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-display flex items-start gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-white/80 text-xs font-bold font-display block">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="ali@gmail.com"
                  className={`w-full bg-[#111111]/70 border ${
                    emailError ? 'border-red-500/60 focus:border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                  } px-4 py-3.5 text-white outline-none transition-colors placeholder:text-white/20 font-display text-[15px]`}
                />
              </div>
              {emailError && (
                <div className="text-red-400 text-xs font-display flex items-center gap-1.5 mt-1">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-white/80 text-xs font-bold font-display block">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="••••••••"
                  className={`w-full bg-[#111111]/70 border ${
                    passwordError ? 'border-red-500/60 focus:border-red-500' : 'border-white/15 focus:border-[#C5A059]'
                  } px-4 py-3.5 text-white outline-none transition-colors placeholder:text-white/20 font-display text-[15px] pl-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-[#C5A059] transition-colors p-1 cursor-pointer"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <div className="text-red-400 text-xs font-display flex items-center gap-1.5 mt-1">
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{passwordError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loginMutation.isPending}
              className="w-full py-4 bg-[#C5A059] hover:bg-[#d4b06a] text-[#080808] font-bold text-xs tracking-[0.25em] font-display uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(197,160,89,0.25)] hover:shadow-[0_0_35px_rgba(197,160,89,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-[#C5A059] mt-2"
            >
              {loginMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <svg className="w-4 h-4 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      <footer className="relative z-10 w-full px-[5vw] py-5 text-center text-white/20 text-[10px] tracking-[0.3em] font-display uppercase border-t border-white/[0.06]">
        NOUH AGENCY © {new Date().getFullYear()} — جميع الحقوق محفوظة
      </footer>
    </main>
  )
}
