import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { CloseIcon } from '../Icons'

export type ToastOptions = {
  title: string
  description?: string
  /** A single follow-up action, e.g. "Undo". Toasts with an action stay until dismissed. */
  action?: { label: string; onClick: () => void }
  /** Milliseconds before the toast dismisses itself. Defaults to 6000, or never if it has an action. */
  duration?: number
}

type ToastData = ToastOptions & { id: string }

type ToastContextValue = {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside a ToastProvider')
  return context
}

const DEFAULT_DURATION = 6000
const HOTKEY = 'F8'

type ToastItemProps = {
  toast: ToastData
  paused: boolean
  onDismiss: (id: string) => void
}

const ToastItem = ({ toast, paused, onDismiss }: ToastItemProps) => {
  const id = useId()
  const duration = toast.duration ?? (toast.action ? Number.POSITIVE_INFINITY : DEFAULT_DURATION)
  const remaining = useRef(duration)

  // Count down only while not paused, keeping the time left across pauses (WCAG 2.2.1 Timing Adjustable)
  useEffect(() => {
    if (paused || !Number.isFinite(remaining.current)) return

    const startedAt = Date.now()
    const timer = setTimeout(() => onDismiss(toast.id), remaining.current)

    return () => {
      clearTimeout(timer)
      remaining.current -= Date.now() - startedAt
    }
  }, [paused, onDismiss, toast.id])

  return (
    <li
      data-toast-id={toast.id}
      aria-labelledby={`${id}-title`}
      aria-describedby={toast.description ? `${id}-description` : undefined}
      className="pointer-events-auto relative flex w-full animate-slide-in gap-3 overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-4 pl-5 shadow-2xl"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-accent" />
      <div className="min-w-0 flex-1">
        <p id={`${id}-title`} className="font-medium text-sm text-white">
          {toast.title}
        </p>
        {toast.description && (
          <p id={`${id}-description`} className="mt-1 text-neutral-400 text-sm">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              onDismiss(toast.id)
            }}
            className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-sm text-white transition hover:border-accent/40 hover:text-accent"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white"
      >
        <CloseIcon className="size-4" />
        <span className="sr-only">Dismiss notification</span>
      </button>
    </li>
  )
}

export type ToastProviderProps = {
  children: ReactNode
  /** Maximum number of toasts shown at once. Older ones are dismissed first. */
  limit?: number
}

/**
 * Renders a notifications region and provides `useToast()`. The list is a polite live region, so new toasts
 * are announced without moving focus. Press F8 to jump to the region. Timers pause while it has hover or focus.
 */
export const ToastProvider = ({ children, limit = 3 }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const regionRef = useRef<HTMLOListElement>(null)
  const nextId = useRef(0)

  const dismiss = useCallback((id: string) => {
    // If the toast being removed has focus, move it to the region so it isn't lost to <body>
    if (document.activeElement?.closest('[data-toast-id]')?.getAttribute('data-toast-id') === id) {
      regionRef.current?.focus()
    }
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      nextId.current += 1
      const id = `toast-${nextId.current}`
      setToasts((current) => [...current, { ...options, id }].slice(-limit))
      return id
    },
    [limit],
  )

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === HOTKEY) {
        event.preventDefault()
        regionRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext value={value}>
      {children}
      <section aria-label={`Notifications (${HOTKEY})`}>
        <ol
          ref={regionRef}
          tabIndex={-1}
          aria-live="polite"
          aria-relevant="additions"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false)
          }}
          className="pointer-events-none fixed right-0 bottom-0 z-50 flex w-full max-w-sm flex-col gap-3 p-4 sm:p-6"
        >
          {toasts.map((item) => (
            <ToastItem key={item.id} toast={item} paused={hovered || focused} onDismiss={dismiss} />
          ))}
        </ol>
      </section>
    </ToastContext>
  )
}
