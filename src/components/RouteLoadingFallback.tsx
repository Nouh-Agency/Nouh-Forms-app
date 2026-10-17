export default function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex-1 flex flex-col items-center justify-center min-h-[320px] py-16 text-center"
    >
      <div className="w-9 h-9 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <span className="text-[#C5A059] text-xs font-medium tracking-[0.25em] font-display uppercase">
        جاري التحميل...
      </span>
    </div>
  )
}
