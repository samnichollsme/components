# Sam Nicholls — Components

A small library of accessible React components, built from scratch as a portfolio showcase. The docs site is a Storybook, deployed to Cloudflare Workers.

I'm a Senior Front-End Engineer, and this project is where I show how I build interactive components: following the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/), meeting **WCAG 2.2 AA**, and proving it with automated tests in a real browser. It isn't published to npm. The code is meant to be read.

## Components

| Component | What it shows |
|---|---|
| **Accordion** | Headings with disclosure buttons, single or multiple open, arrow-key navigation between headers |
| **Button** | Native button with variants and sizes, all above the 24px minimum target size |
| **Combobox** | Editable combobox with list autocomplete, `aria-activedescendant` and live result counts |
| **Dialog** | Modal and alert dialogs on the native `<dialog>` element, with focus return and initial focus control |
| **Switch** | `role="switch"` with a clickable label and linked description |
| **Tabs** | Roving `tabindex` with automatic activation, horizontal or vertical |
| **Toast** | Polite live-region notifications, pausable timers, an F8 hotkey, and no lost focus on dismiss |
| **Tooltip** | Hover and focus descriptions that meet WCAG 1.4.13 (dismissible, hoverable, persistent) |

Each component's docs page lists its keyboard interactions and explains its accessibility decisions.

## Tech stack

| | |
|---|---|
| **Framework** | [React](https://react.dev) with [TypeScript](https://www.typescriptlang.org) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Docs** | [Storybook](https://storybook.js.org) |
| **Testing** | [Vitest](https://vitest.dev) browser mode with [Playwright](https://playwright.dev), and [axe](https://github.com/dequelabs/axe-core) via Storybook's accessibility addon |
| **Build tool** | [Vite](https://vite.dev) |
| **Runtime / package manager** | [Bun](https://bun.sh) |
| **Linting & formatting** | [Biome](https://biomejs.dev), with [Lefthook](https://lefthook.dev) pre-commit hooks |
| **Hosting** | [Cloudflare Workers](https://workers.cloudflare.com) |

## Accessibility testing

Every story is also a test. `bun run test` renders each story in headless Chromium, then:

1. **Runs its play function.** These drive the component with the keyboard and mouse the way a user would, and check focus, ARIA state and announcements. For example, the Tabs story checks that arrow keys skip disabled tabs and wrap round, and the Dialog story checks that Escape closes it and returns focus to the trigger.
2. **Runs axe against the final state.** Any violation, including colour contrast, fails the test. Play functions finish with things open (dialogs, listboxes, toasts) so axe checks those states too.

The same checks show live in Storybook's **Interactions** and **Accessibility** panels.

Automated tests catch a lot, but not everything (axe can't tell whether an announcement makes sense, for example). Changes should also be checked by hand with a keyboard and a screen reader.

## Design

- **Monochrome with a single accent colour**, matching [samnicholls.me](https://samnicholls.me). The accent is one CSS variable (`--color-accent` in `src/index.css`), so every component can be re-themed by changing one line.
- **Contrast checked.** Text reaches 4.5:1, and input borders and other component boundaries reach 3:1.
- **Short, one-off motion only**, turned off for anyone who prefers reduced motion.

## Getting started

You'll need [Bun](https://bun.sh) installed.

```bash
bun install                            # Install dependencies (also sets up the pre-commit hook)
bunx playwright install chromium       # One-off: the browser the tests run in
bun run dev                            # Start Storybook at http://localhost:6006
```

### Scripts

| Command | What it does |
|---|---|
| `bun run dev` | Start Storybook locally |
| `bun run test` | Run every story as an interaction and accessibility test |
| `bun run test:watch` | Same, in watch mode |
| `bun run build` | Check code with Biome, type-check, then build the Storybook to `dist/` |
| `bun run preview` | Preview the production build locally |
| `bun run check` | Format, lint and fix the codebase with Biome |
| `bun run lint` | Lint only |
| `bun run format` | Format only |
| `bun run deploy` | Build and deploy manually (requires `bunx wrangler login` first) |

## Project structure

```
.storybook/              # Storybook config, dark theme and head tags
src/
  index.css              # Tailwind import, theme tokens and global styles
  index.ts               # Exports every component
  components/
    <Name>/
      <Name>.tsx         # The component (and any parts, e.g. Tab, TabList, TabPanel)
      <Name>.stories.tsx # Docs, examples and tests
    Icons.tsx            # Shared decorative icons
  hooks/                 # Shared hooks, e.g. useControllableState
  utils/                 # Small helpers: class names, roving focus
  docs/                  # MDX pages, e.g. the introduction
```

## Deployment

The Storybook is hosted on Cloudflare Workers as static assets at **[components.samnicholls.me](https://components.samnicholls.me)** (configured in `wrangler.jsonc`). Cloudflare's GitHub integration **builds and deploys automatically on every push to `main`**.

The build runs Biome and TypeScript first, so code with lint, formatting or type errors fails the build and never reaches production.

A [GitHub Actions workflow](.github/workflows/ci.yml) runs the same checks plus the full interaction and accessibility test suite on every push and pull request, so failures show up on the commit or PR.

## Coding standards

Conventions for components, TypeScript, styling, accessibility and testing are documented in [CODING_STANDARDS.md](CODING_STANDARDS.md). Most of them are enforced automatically by Biome.

## Contact

- **Website:** [samnicholls.me](https://samnicholls.me)
- **Email:** [contact@samnicholls.me](mailto:contact@samnicholls.me)
- **LinkedIn:** [Sam Nicholls](https://uk.linkedin.com/in/samuel-nicholls-576253133)
