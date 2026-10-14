import {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useId,
  useRef,
} from 'react'
import { cx } from '../../utils/cx'
import { CloseIcon } from '../Icons'

export type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  /** Buttons shown at the bottom of the dialog */
  actions?: ReactNode
  /**
   * `alertdialog` is for urgent confirmations that interrupt the user. It can't be dismissed
   * by clicking outside, so the user has to make a choice.
   */
  role?: 'dialog' | 'alertdialog'
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const

/**
 * Built on the native `<dialog>` element opened with `showModal()`. The browser handles the focus trap,
 * makes the rest of the page inert and closes on Escape, and this component keeps React state in sync.
 */
export const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  role = 'dialog',
  size = 'md',
}: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`

  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return

    // Return focus to whatever opened the dialog once it closes
    const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const { overflow } = document.body.style

    dialog.showModal()
    document.body.style.overflow = 'hidden'

    // The browser focuses the first focusable element. `data-autofocus` overrides that, e.g. to start on
    // the least destructive action. React doesn't render `autoFocus` as an attribute, so it can't be used here.
    dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()

    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      returnFocusTo?.focus()
    }
  }, [open])

  // Escape fires `cancel`. Hand the decision to the parent instead of letting the browser close it.
  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    onOpenChange(false)
  }

  // Handling Escape here too stops the browser's own cancel, and covers events that aren't trusted key presses
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape' && !event.defaultPrevented) {
      event.preventDefault()
      onOpenChange(false)
    }
  }

  // Browsers can still force-close a dialog (e.g. a repeated Escape), so keep state in sync if they do.
  // `close` fires asynchronously, so check the element is still closed before acting on a stale event.
  const onClose = () => {
    if (open && !ref.current?.open) onOpenChange(false)
  }

  // Clicks on the backdrop target the <dialog> itself, because the content fills it edge to edge
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (role === 'dialog' && event.target === event.currentTarget) onOpenChange(false)
  }

  return (
    <dialog
      ref={ref}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={onCancel}
      onKeyDown={onKeyDown}
      onClose={onClose}
      onClick={onClick}
      className={cx(
        'm-auto w-[calc(100%-2rem)] rounded-3xl border border-white/10 bg-neutral-900 p-0 text-neutral-300 shadow-2xl',
        'backdrop:bg-black/70 backdrop:backdrop-blur-sm open:animate-pop-in open:backdrop:animate-fade-in',
        sizes[size],
      )}
    >
      {open && (
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="font-display font-semibold text-white text-xl">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-2 text-neutral-400 text-sm leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {role === 'dialog' && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-white/10 hover:text-white"
              >
                <CloseIcon className="size-4" />
                <span className="sr-only">Close</span>
              </button>
            )}
          </div>
          {children}
          {actions && <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{actions}</div>}
        </div>
      )}
    </dialog>
  )
}
