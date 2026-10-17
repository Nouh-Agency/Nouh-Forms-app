import { Component, type ErrorInfo, type ReactNode } from 'react'

interface RouteErrorBoundaryProps {
  children: ReactNode
}

interface RouteErrorBoundaryState {
  hasError: boolean
}

export default class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  state: RouteErrorBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    void error
    void errorInfo
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex-1 flex flex-col items-center justify-center min-h-[320px] py-16 text-center px-4"
        >
          <div className="w-10 h-10 border border-red-500/40 bg-red-950/20 text-red-400 rounded-full flex items-center justify-center mb-4 text-base font-bold font-display">
            !
          </div>
          <h3 className="text-white text-base font-bold font-display mb-2">
            حدث خطأ أثناء تحميل الصفحة
          </h3>
          <p className="text-white/50 text-xs font-display mb-6 max-w-md">
            قد يكون تم تحديث التطبيق أو حدث انقطاع مؤقت في الاتصال، يرجى إعادة المحاولة.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="px-6 py-2.5 bg-[#C5A059] text-black font-semibold text-xs tracking-wider font-display uppercase hover:bg-[#d4b06a] transition-colors cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
