import type { ComponentProps } from 'react'
import { cx } from '../../utils/cx'

const variants = {
  primary: 'bg-white text-neutral-950 hover:bg-neutral-200',
  secondary:
    'border border-white/10 bg-white/5 text-neutral-200 hover:border-white/20 hover:bg-white/10 hover:text-white',
  ghost: 'text-neutral-300 hover:bg-white/5 hover:text-white',
  accent: 'bg-accent text-neutral-950 hover:bg-accent/85',
} as const

const sizes = {
  sm: 'min-h-8 gap-1.5 rounded-lg px-3 text-sm',
  md: 'min-h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'min-h-12 gap-2 rounded-xl px-5 text-base',
} as const

export type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = ({ variant = 'secondary', size = 'md', type = 'button', className, ...props }: ButtonProps) => {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex items-center justify-center font-medium transition disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
