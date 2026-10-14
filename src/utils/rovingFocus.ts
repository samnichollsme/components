/** Returns the enabled elements matching `selector` that belong to `owner`, ignoring any nested instance of the same widget. */
export const getOwnedItems = (owner: HTMLElement, selector: string, ownerSelector: string) => {
  return Array.from(owner.querySelectorAll<HTMLElement>(selector)).filter(
    (item) => item.closest(ownerSelector) === owner && !item.hasAttribute('disabled'),
  )
}

/** Index of the item to move to for a roving-focus key press, or `null` if the key isn't a navigation key. */
export const getNextIndex = (key: string, current: number, count: number, prevKey: string, nextKey: string) => {
  switch (key) {
    case nextKey:
      return (current + 1) % count
    case prevKey:
      return (current - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}
