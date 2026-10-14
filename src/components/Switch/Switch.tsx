import { useId } from 'react'
import { useControllableState } from '../../hooks/useControllableState'
import { cx } from '../../utils/cx'

export type SwitchProps = {
  label: string
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export const Switch = ({
  label,
  description,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled,
}: SwitchProps) => {
  const id = useId()
  const descriptionId = `${id}-description`
  const [checked, setChecked] = useControllableState({
    value: checkedProp,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  })

  return (
    <div className={cx('flex items-start gap-3', disabled && 'opacity-50')}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => setChecked(!checked)}
        className={cx(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition',
          checked ? 'border-accent bg-accent' : 'border-neutral-500 bg-neutral-900',
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            'size-4 rounded-full shadow transition',
            checked ? 'translate-x-6 bg-neutral-950' : 'translate-x-1 bg-neutral-400',
          )}
        />
      </button>
      <div>
        <label htmlFor={id} className="font-medium text-sm text-white">
          {label}
        </label>
        {description && (
          <p id={descriptionId} className="mt-0.5 text-neutral-400 text-sm">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
