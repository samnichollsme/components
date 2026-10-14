import { createContext, type KeyboardEvent, type ReactNode, useContext, useId } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { cx } from '../../utils/cx'
import { getNextIndex, getOwnedItems } from '../../utils/rovingFocus'

type Orientation = 'horizontal' | 'vertical'

type TabsContextValue = {
  baseId: string
  orientation: Orientation
  selected: string
  select: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab components must be used inside Tabs')
  return context
}

// Values can contain characters that aren't valid in an id, so encode them
const toId = (baseId: string, part: 'tab' | 'panel', value: string) => `${baseId}-${part}-${encodeURIComponent(value)}`

export type TabsProps = {
  children: ReactNode
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: Orientation
}

export const Tabs = ({ children, defaultValue, value, onValueChange, orientation = 'horizontal' }: TabsProps) => {
  const baseId = useId()
  const [selected, select] = useControllableState({ value, defaultValue, onChange: onValueChange })

  return (
    <TabsContext value={{ baseId, orientation, selected, select }}>
      <div className={cx('flex gap-6', orientation === 'horizontal' ? 'flex-col' : 'flex-row')}>{children}</div>
    </TabsContext>
  )
}

export type TabListProps = {
  children: ReactNode
  /** Accessible name for the tab list, describing what the tabs switch between */
  label: string
}

export const TabList = ({ children, label }: TabListProps) => {
  const { orientation } = useTabs()
  const vertical = orientation === 'vertical'

  // Roving focus with automatic activation: moving focus to a tab also selects it
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) return

    const tabs = getOwnedItems(event.currentTarget, '[role="tab"]', '[role="tablist"]')
    const [prevKey, nextKey] = vertical ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight']
    const next = getNextIndex(event.key, tabs.indexOf(event.target), tabs.length, prevKey, nextKey)
    if (next === null) return

    event.preventDefault()
    tabs[next].focus()
    tabs[next].click()
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      className={cx('flex shrink-0 gap-1', vertical ? 'flex-col' : 'overflow-x-auto border-white/10 border-b')}
    >
      {children}
    </div>
  )
}

export type TabProps = {
  value: string
  children: ReactNode
  disabled?: boolean
}

export const Tab = ({ value, children, disabled }: TabProps) => {
  const { baseId, orientation, selected, select } = useTabs()
  const isSelected = selected === value

  return (
    <button
      id={toId(baseId, 'tab', value)}
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={toId(baseId, 'panel', value)}
      tabIndex={isSelected ? 0 : -1}
      disabled={disabled}
      onClick={() => select(value)}
      className={cx(
        'relative whitespace-nowrap px-4 py-2.5 font-medium text-sm transition disabled:opacity-50',
        isSelected ? 'text-white' : 'text-neutral-400 hover:text-white',
        // Selection indicator: a bar along the edge facing the panel
        'after:absolute after:bg-accent after:transition',
        orientation === 'horizontal'
          ? 'after:inset-x-0 after:-bottom-px after:h-0.5'
          : 'rounded-lg text-left after:inset-y-1 after:left-0 after:w-0.5',
        isSelected ? 'after:opacity-100' : 'after:opacity-0',
      )}
    >
      {children}
    </button>
  )
}

export type TabPanelProps = {
  value: string
  children: ReactNode
}

export const TabPanel = ({ value, children }: TabPanelProps) => {
  const { baseId, selected } = useTabs()

  return (
    <div
      id={toId(baseId, 'panel', value)}
      role="tabpanel"
      aria-labelledby={toId(baseId, 'tab', value)}
      // Focusable so keyboard users can reach panels that contain no interactive content
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the APG tabs pattern makes panels focusable
      tabIndex={0}
      hidden={selected !== value}
      className="min-w-0 flex-1 rounded-xl text-neutral-300"
    >
      {children}
    </div>
  )
}
