import { useCallback, useState } from 'react'

type UseControllableStateOptions<T> = {
  value?: T
  defaultValue: T
  onChange?: (value: T) => void
}

/**
 * State that can be controlled (`value` + `onChange`) or uncontrolled (`defaultValue`),
 * so every component supports both without duplicating the logic.
 */
export const useControllableState = <T>({ value, defaultValue, onChange }: UseControllableStateOptions<T>) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternalValue(next)
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  return [currentValue, setValue] as const
}
