type ClassValue = string | false | null | undefined

/** Joins class names, skipping falsy values: `cx('a', isOn && 'b')` */
export const cx = (...classes: ClassValue[]) => classes.filter(Boolean).join(' ')
