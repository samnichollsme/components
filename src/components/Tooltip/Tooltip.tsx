import { cloneElement, type ReactElement, useEffect, useId, useRef, useState } from 'react'
import { cx } from '../../utils/cx'

export type TooltipProps = {
  content: string
  /** A single focusable element, such as a button. It receives `aria-describedby` pointing at the tooltip. */
  children: ReactElement<{ 'aria-describedby'?: string }>
  side?: 'top' | 'bottom'
  /** Milliseconds to wait on hover before showing. Keyboard focus shows it straight away. */
  delay?: number
}

const sides = {
  top: 'bottom-full pb-2',
  bottom: 'top-full pt-2',
} as const

/**
 * Supplementary description shown on hover and focus. Meets WCAG 1.4.13: it can be dismissed with Escape,
 * it stays open while the pointer moves onto it, and it stays until hover or focus leaves.
 */
export const Tooltip = ({ content, children, side = 'top', delay = 300 }: TooltipProps) => {
  const id = useId()
  const [open, setOpen] = useState(false)
  const showTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => () => clearTimeout(showTimer.current), [])

  const show = (wait: number) => {
    clearTimeout(showTimer.current)
    showTimer.current = setTimeout(() => setOpen(true), wait)
  }

  const hide = () => {
    clearTimeout(showTimer.current)
    setOpen(false)
  }

  return (
    // The wrapper only listens for hover and focus bubbling up from the trigger, which handles its own keyboard input
    // biome-ignore lint/a11y/noStaticElementInteractions: see above
    <span
      className="relative inline-flex"
      onPointerEnter={() => show(delay)}
      onPointerLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      {/* Always rendered so aria-describedby resolves, but hidden from view until open */}
      <span
        id={id}
        role="tooltip"
        className={cx(
          'absolute left-1/2 z-50 w-max max-w-xs -translate-x-1/2',
          sides[side],
          open ? 'animate-fade-in' : 'hidden',
        )}
      >
        <span className="block rounded-lg border border-white/10 bg-neutral-800 px-3 py-1.5 text-neutral-200 text-xs shadow-xl">
          {content}
        </span>
      </span>
    </span>
  )
}
