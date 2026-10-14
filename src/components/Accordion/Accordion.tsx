import { createContext, type KeyboardEvent, type ReactNode, useContext, useId, useRef } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { cx } from '../../utils/cx'
import { getNextIndex, getOwnedItems } from '../../utils/rovingFocus'
import { ChevronDownIcon } from '../Icons'

type AccordionContextValue = {
  headingLevel: 2 | 3 | 4 | 5 | 6
  isOpen: (value: string) => boolean
  toggle: (value: string) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

const useAccordion = () => {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('AccordionItem must be used inside an Accordion')
  return context
}

export type AccordionProps = {
  children: ReactNode
  /** Let more than one section be open at once */
  multiple?: boolean
  /** Heading level for each section title, so it fits the page outline */
  headingLevel?: AccordionContextValue['headingLevel']
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

export const Accordion = ({
  children,
  multiple = false,
  headingLevel = 3,
  value,
  defaultValue = [],
  onValueChange,
}: AccordionProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [openValues, setOpenValues] = useControllableState({ value, defaultValue, onChange: onValueChange })

  const toggle = (itemValue: string) => {
    if (openValues.includes(itemValue)) {
      setOpenValues(openValues.filter((open) => open !== itemValue))
    } else {
      setOpenValues(multiple ? [...openValues, itemValue] : [itemValue])
    }
  }

  // Optional APG keyboard support: arrow keys, Home and End move between section headers
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const root = ref.current
    if (!root || !(event.target instanceof HTMLElement) || !event.target.matches('[data-accordion-trigger]')) return

    const triggers = getOwnedItems(root, '[data-accordion-trigger]', '[data-accordion]')
    const next = getNextIndex(event.key, triggers.indexOf(event.target), triggers.length, 'ArrowUp', 'ArrowDown')
    if (next === null) return

    event.preventDefault()
    triggers[next].focus()
  }

  return (
    <AccordionContext value={{ headingLevel, isOpen: (item) => openValues.includes(item), toggle }}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: delegates arrow keys from the header buttons inside it */}
      <div
        ref={ref}
        data-accordion=""
        onKeyDown={onKeyDown}
        className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-neutral-900/40"
      >
        {children}
      </div>
    </AccordionContext>
  )
}

export type AccordionItemProps = {
  value: string
  title: string
  children: ReactNode
  disabled?: boolean
}

export const AccordionItem = ({ value, title, children, disabled }: AccordionItemProps) => {
  const { headingLevel, isOpen, toggle } = useAccordion()
  const id = useId()
  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel`
  const open = isOpen(value)
  const Heading = `h${headingLevel}` as const

  return (
    <div>
      <Heading className="font-display font-semibold text-base text-white">
        <button
          id={triggerId}
          type="button"
          data-accordion-trigger=""
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => toggle(value)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition hover:text-accent disabled:opacity-50"
        >
          {title}
          <ChevronDownIcon className={cx('size-5 shrink-0 text-neutral-400 transition', open && 'rotate-180')} />
        </button>
      </Heading>
      <section id={panelId} aria-labelledby={triggerId} hidden={!open} className="px-5 pb-5 text-neutral-300">
        {children}
      </section>
    </div>
  )
}
