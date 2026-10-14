import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { cx } from '../../utils/cx'
import { CheckIcon, ChevronDownIcon } from '../Icons'

export type ComboboxOption = {
  value: string
  label: string
  disabled?: boolean
}

export type ComboboxProps = {
  label: string
  options: ComboboxOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  description?: string
  disabled?: boolean
}

const matches = (option: ComboboxOption, query: string) =>
  option.label.toLowerCase().includes(query.trim().toLowerCase())

/** Steps through `options` from `from` in `direction`, skipping disabled options. Returns -1 if none are enabled. */
const findEnabled = (options: ComboboxOption[], from: number, direction: 1 | -1) => {
  for (let step = 0; step < options.length; step++) {
    const index = (from + direction * step + options.length * 2) % options.length
    if (!options[index].disabled) return index
  }
  return -1
}

/**
 * An editable combobox with list autocomplete, following the WAI-ARIA APG pattern. Focus stays in the
 * input and `aria-activedescendant` points at the highlighted option, so typing and arrowing work together.
 */
export const Combobox = ({
  label,
  options,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder,
  description,
  disabled,
}: ComboboxProps) => {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const ids = {
    label: `${id}-label`,
    listbox: `${id}-listbox`,
    description: `${id}-description`,
    option: (option: ComboboxOption) => `${id}-option-${options.indexOf(option)}`,
  }

  const [value, setValue] = useControllableState({ value: valueProp, defaultValue, onChange: onValueChange })
  const selectedLabel = options.find((option) => option.value === value)?.label ?? ''

  const [inputValue, setInputValue] = useState(selectedLabel)
  const [open, setOpen] = useState(false)
  // `null` shows every option, e.g. when opened with the arrow keys instead of by typing
  const [query, setQuery] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Keep the text in sync when a controlled value changes from outside
  const [prevSelectedLabel, setPrevSelectedLabel] = useState(selectedLabel)
  if (selectedLabel !== prevSelectedLabel) {
    setPrevSelectedLabel(selectedLabel)
    setInputValue(selectedLabel)
  }

  const filtered = query ? options.filter((option) => matches(option, query)) : options
  const expanded = open && filtered.length > 0
  const activeOption = expanded ? filtered[activeIndex] : undefined

  useEffect(() => {
    if (!activeOption) return
    listboxRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [activeOption, activeIndex])

  const openList = (highlight: 'selected' | 'first' | 'last' | 'none') => {
    setQuery(null)
    setOpen(true)
    const selectedIndex = options.findIndex((option) => option.value === value && !option.disabled)
    if (highlight === 'selected' && selectedIndex !== -1) setActiveIndex(selectedIndex)
    else if (highlight === 'selected' || highlight === 'first') setActiveIndex(findEnabled(options, 0, 1))
    else if (highlight === 'last') setActiveIndex(findEnabled(options, options.length - 1, -1))
    else setActiveIndex(-1)
  }

  const close = () => {
    setOpen(false)
    setQuery(null)
    setActiveIndex(-1)
  }

  const select = (option: ComboboxOption) => {
    if (option.disabled) return
    setValue(option.value)
    setInputValue(option.label)
    close()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!expanded) openList(event.altKey ? 'none' : 'selected')
        else setActiveIndex(findEnabled(filtered, activeIndex + 1, 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        if (event.altKey) close()
        else if (!expanded) openList('last')
        else setActiveIndex(findEnabled(filtered, activeIndex === -1 ? filtered.length - 1 : activeIndex - 1, -1))
        break
      case 'Enter':
        if (activeOption) {
          event.preventDefault()
          select(activeOption)
        }
        break
      case 'Escape':
        event.preventDefault()
        if (open) {
          close()
        } else {
          setInputValue('')
          setValue(null)
        }
        break
    }
  }

  // Leaving the field either confirms an empty value or restores the last valid selection
  const onBlur = () => {
    close()
    if (inputValue.trim() === '') setValue(null)
    else setInputValue(selectedLabel)
  }

  const resultCount = `${filtered.length} ${filtered.length === 1 ? 'result' : 'results'} available`

  return (
    <div className={cx('flex flex-col gap-2', disabled && 'opacity-50')}>
      <label id={ids.label} htmlFor={`${id}-input`} className="font-medium text-sm text-white">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={ids.listbox}
          aria-activedescendant={activeOption ? ids.option(activeOption) : undefined}
          aria-describedby={description ? ids.description : undefined}
          placeholder={placeholder}
          disabled={disabled}
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value)
            setQuery(event.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          className="w-full rounded-xl border border-neutral-500 bg-neutral-900 py-2.5 pr-11 pl-4 text-sm text-white transition placeholder:text-neutral-400 hover:border-neutral-400"
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={`Show ${label} options`}
          aria-controls={ids.listbox}
          aria-expanded={expanded}
          disabled={disabled}
          // Keep focus in the input so the combobox doesn't blur and close
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (expanded) close()
            else openList('none')
            inputRef.current?.focus()
          }}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral-400 transition hover:text-white"
        >
          <ChevronDownIcon className={cx('size-4 transition', expanded && 'rotate-180')} />
        </button>

        <div
          ref={listboxRef}
          id={ids.listbox}
          role="listbox"
          aria-labelledby={ids.label}
          hidden={!expanded}
          className="absolute inset-x-0 top-full z-10 mt-2 max-h-64 animate-fade-in overflow-y-auto rounded-xl border border-white/10 bg-neutral-900 p-1 shadow-2xl"
        >
          {filtered.map((option, index) => (
            // biome-ignore lint/a11y/useFocusableInteractive lint/a11y/useKeyWithClickEvents: options are never focused; the input handles the keyboard and points at them with aria-activedescendant
            <div
              key={option.value}
              id={ids.option(option)}
              data-index={index}
              role="option"
              aria-selected={index === activeIndex}
              aria-disabled={option.disabled || undefined}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(option)}
              onMouseMove={() => !option.disabled && setActiveIndex(index)}
              className={cx(
                'flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm',
                index === activeIndex ? 'bg-white/10 text-white' : 'text-neutral-300',
                option.disabled && 'opacity-50',
              )}
            >
              {option.label}
              {option.value === value && <CheckIcon className="size-4 shrink-0 text-accent" />}
            </div>
          ))}
        </div>

        {open && filtered.length === 0 && (
          <p
            aria-hidden="true"
            className="absolute inset-x-0 top-full z-10 mt-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3 text-neutral-400 text-sm shadow-2xl"
          >
            No results found
          </p>
        )}
      </div>
      {description && (
        <p id={ids.description} className="text-neutral-400 text-sm">
          {description}
        </p>
      )}
      <div role="status" className="sr-only">
        {open && query !== null ? (filtered.length ? resultCount : 'No results found') : ''}
      </div>
    </div>
  )
}
