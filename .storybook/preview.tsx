import type { Preview } from '@storybook/react-vite'
import '../src/index.css'
import { theme } from './theme'

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { disabled: true },
    docs: { theme },
    controls: {
      matchers: { color: /(background|color)$/i },
    },
    a11y: {
      // Any axe violation fails the story's test, in the Storybook UI and in `bun run test`
      test: 'error',
    },
    options: {
      storySort: { order: ['Introduction', 'Components'] },
    },
  },
}

export default preview
