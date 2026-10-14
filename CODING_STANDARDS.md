# Coding Standards

Conventions for this project. They match my [portfolio](https://github.com/samnichollsme/portfolio), with additions for building and testing reusable components. When in doubt, match the surrounding code: consistency matters more than any individual rule.

## Components

### Use arrow functions (enforced)

Define components (and helper functions) as `const` arrow functions, not `function` declarations.

```tsx
// ✅ Do
export const Switch = ({ label }: SwitchProps) => {
  return <button role="switch">…</button>
}

// ❌ Don't
export function Switch({ label }: SwitchProps) {
  return <button role="switch">…</button>
}
```

**Why:** Both compile to the same thing and perform identically, so this is a consistency choice. Arrow functions match how handlers and helpers are already written, can't be reassigned, and can't be used before they're defined.

**Things to know:**

- Arrow functions aren't hoisted. Define helper components (e.g. `ToastItem`) *above* the component that uses them.
- Generic components and hooks in `.tsx` need a trailing comma so the generic isn't parsed as JSX: `const useControllableState = <T,>(…) => { … }`.

### Exports

- Use **named exports** (enforced). The only default exports are Storybook's: story `meta`, `.storybook/*` config and `vite.config.ts`.
- Keep small, single-use helper components unexported in the same file as the component that uses them (e.g. `ToastItem` in `Toast.tsx`).
- Export each component's props type too (`export type SwitchProps`), so consumers can wrap components.

### Props

- Type props with a `type` alias named `<Component>Props`, declared above the component.
- Destructure props in the parameter list.
- Don't use `React.FC`. Type the props directly instead.
- Components that wrap one native element (e.g. `Button`) accept all of that element's props with `ComponentProps<'button'>` and spread them on.

### State: controlled and uncontrolled

Every stateful component supports both, with the same prop names everywhere:

| Prop | Purpose |
|---|---|
| `value` / `checked` | Controlled state |
| `defaultValue` / `defaultChecked` | Initial uncontrolled state |
| `onValueChange` / `onCheckedChange` | Called with the new state |

Use `useControllableState` from `src/hooks` rather than reimplementing this. The exception is `Dialog`, which is always controlled (`open` + `onOpenChange`) because something outside it always opens it.

### Compound components

Components made of parts that must work together (`Tabs`, `TabList`, `Tab`, `TabPanel`) share state through a React context, all in one file. The context hook throws a clear error if a part is used outside its parent.

## File structure

```
src/
  index.css              # Tailwind import, theme tokens and global styles
  index.ts               # Exports every component
  components/
    <Name>/
      <Name>.tsx         # The component and its parts
      <Name>.stories.tsx # Docs, examples and tests
    Icons.tsx            # Shared decorative icons
  hooks/                 # Shared hooks
  utils/                 # Small helpers
  docs/                  # MDX pages
```

- Component files use **PascalCase** and match the component name (`Switch.tsx` → `Switch`).
- Every component has a stories file. Add new components to `src/index.ts` and the table in `src/docs/Introduction.mdx`.

## TypeScript

- Use `type`, not `interface` (enforced).
- Use `import type` for type-only imports (enforced).
- Use `as const` on static data objects so values are typed as literals.
- No `any` (enforced). If a type is genuinely unknown, use `unknown` and narrow it.

## Styling

- Style with **Tailwind utility classes** only, with no separate CSS files per component.
- Join conditional classes with `cx()` from `src/utils/cx.ts`. For variants, map names to classes in an `as const` object (see `Button.tsx`).
- Theme values (fonts, animations, colours) live in the `@theme` block in `src/index.css`.
- The design is **monochrome with one accent colour**:
  - Use `neutral-*` greys, `white` and `black` for most of the UI.
  - Use `accent` (`text-accent`, `bg-accent`, etc.) **sparingly**: selected states, indicators, focus and hover.
  - Never hard-code a colour. Change `--color-accent` in `index.css` to re-theme.
- Write mobile-first: base classes for small screens, with `sm:` / `md:` for larger ones.

## Accessibility

Target **WCAG 2.2 AA**, and follow the [WAI-ARIA Authoring Practices (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/) pattern for each widget.

### Start native

- Use the native element when one exists: `<button>`, `<label>`, `<dialog>`, `hidden`. It brings keyboard support, focus and semantics for free.
- Only add ARIA roles and states the native element doesn't already have. Link related elements with `aria-controls`, `aria-labelledby` and `aria-describedby`, using ids from `useId()`.

### Keyboard

- Everything works with a keyboard, following the APG pattern's keyboard interactions.
- Composite widgets (tabs, listboxes) are a **single Tab stop**. Move within them using arrow keys, with a roving `tabindex` or `aria-activedescendant`. Use the helpers in `src/utils/rovingFocus.ts`.
- **Never lose focus.** When the focused element closes or disappears, move focus somewhere sensible (e.g. back to the dialog's trigger, or to the toast region).
- Document each component's keys in a table in its story's `docs.description.component`.

### Colour contrast

- Body and small text must reach **4.5:1**, large text (24px+, or 18.5px+ bold) **3:1**.
- On the dark background, the lightest grey that passes for small text is `neutral-400`. **Don't use `neutral-500` or darker for text.**
- Component boundaries that identify a control (input borders, switch tracks) need **3:1**. Use `neutral-500` or lighter.
- Text on `bg-accent` must be `neutral-950`, not white.
- Disabled controls are exempt.

### Names and labels

- Every control has a visible label where possible. Accessible names **start with the visible text** (WCAG 2.5.3).
- Decorative SVGs get `aria-hidden="true"`. Icon-only buttons get `sr-only` text (e.g. "Close").
- Announce dynamic changes (result counts, notifications) through a live region that's already in the DOM, not by moving focus.

### Focus

- Focus styles are global (`:focus-visible` in `index.css`, 2px accent outline). Don't remove outlines with `outline-none` on interactive elements.
- Targets are at least 24×24px (WCAG 2.5.8).

### Motion and timing

- All animations must respect `prefers-reduced-motion` (handled globally in `index.css`).
- **No infinite or looping animations.** Keep motion to short, one-off transitions.
- Anything that disappears on a timer must pause on hover and focus (WCAG 2.2.1), and anything with an action must not disappear on its own.

## Stories and tests

Stories are the docs and the tests.

- Use `title: 'Components/<Name>'` and type stories with `satisfies Meta<typeof Component>`.
- Give every story that has behaviour a `play` function using `canvas` and `userEvent` from the story context, and `expect` from `storybook/test`.
- Query by **role and accessible name** (`getByRole('tab', { name: 'Billing' })`), the way assistive technology finds elements. Avoid test ids.
- Test the keyboard, not just clicks: focus order, arrow keys, Escape, and where focus ends up.
- End play functions with overlays open (dialogs, listboxes, tooltips) so axe checks that state too.
- axe runs after every story with `a11y.test: 'error'`, so any violation fails `bun run test`. Don't turn it off for a story. Fix the component instead.
- Story demos that need hooks go in a small named component in the stories file (e.g. `DialogDemo`), not inline in `render`.

## Tooling: Biome

Formatting and linting are handled by [Biome](https://biomejs.dev), configured in `biome.json`. Rules marked **(enforced)** in this file are checked automatically. Everything else is by convention.

| Command | What it does |
|---|---|
| `bun run check` | Format, lint and organise imports, applying safe fixes |
| `bun run format` | Format only |
| `bun run lint` | Lint only |

It runs at three points:

1. **On save in VS Code.** Install the recommended Biome extension (`.vscode/extensions.json`); the workspace settings format and fix on save.
2. **On commit.** A [Lefthook](https://lefthook.dev) pre-commit hook runs `biome check --write` on staged files and re-stages fixes. It's installed automatically by `bun install`.
3. **In CI.** `bun run build` runs `biome ci` first, so code with lint errors or bad formatting **fails the GitHub Actions workflow and never reaches production**.

### Formatting (enforced)

- 2-space indentation, 120-character line width.
- Single quotes in TS, double quotes in JSX attributes.
- No semicolons (except where required), trailing commas everywhere.
- Imports are sorted automatically.
- Tailwind classes are sorted automatically (Biome `useSortedClasses`).

### Suppressing a rule

If a rule genuinely doesn't apply, suppress it on the line with a reason. Never disable it globally:

```tsx
// biome-ignore lint/a11y/noNoninteractiveTabindex: the APG tabs pattern makes panels focusable
tabIndex={0}
```

Biome's accessibility rules are written for typical pages, so they sometimes flag a correct ARIA pattern (for example, options in an `aria-activedescendant` listbox are never focusable). Suppress those with a reason that names the pattern.
