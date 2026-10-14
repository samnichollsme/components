import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const StrokeIcon = ({ children, ...props }: IconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const CloseIcon = (props: IconProps) => {
  return (
    <StrokeIcon {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </StrokeIcon>
  )
}

export const CheckIcon = (props: IconProps) => {
  return (
    <StrokeIcon strokeWidth={2.2} {...props}>
      <path d="m5 12 5 5 9-10" />
    </StrokeIcon>
  )
}

export const ChevronDownIcon = (props: IconProps) => {
  return (
    <StrokeIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </StrokeIcon>
  )
}

export const InfoIcon = (props: IconProps) => {
  return (
    <StrokeIcon strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v5M12 7.5v.01" />
    </StrokeIcon>
  )
}
