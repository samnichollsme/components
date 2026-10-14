import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, waitFor } from 'storybook/test'
import { Button } from '../Button/Button'
import { InfoIcon } from '../Icons'
import { Tooltip } from './Tooltip'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    content: 'Your data is encrypted before it leaves your device.',
    children: (
      <Button variant="ghost" size="sm" className="px-2">
        <InfoIcon className="size-5" />
        <span className="sr-only">About encryption</span>
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div className="py-16">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: [
          'A short description that appears when its trigger is hovered or focused, following the [WAI-ARIA tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).',
          '',
          '| Key | Action |',
          '|---|---|',
          '| <kbd>Tab</kbd> | Focusing the trigger shows the tooltip straight away |',
          '| <kbd>Escape</kbd> | Hides the tooltip without moving focus |',
          '',
          'Meets [WCAG 1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus): it can be dismissed, you can move the pointer onto it without it disappearing, and it stays until you move away. The trigger gets `aria-describedby`, so the tooltip is read as a description. It never replaces the accessible name, so icon-only triggers still need their own label.',
          '',
          'Tooltips aren’t available on touch screens, so never put essential information in one.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'About encryption' })

    await userEvent.tab()
    const tooltip = await canvas.findByRole('tooltip')
    await expect(trigger).toHaveAccessibleDescription('Your data is encrypted before it leaves your device.')

    await userEvent.keyboard('{Escape}')
    await expect(tooltip).not.toBeVisible()
    await expect(trigger).toHaveFocus()

    await userEvent.hover(trigger)
    await waitFor(() => expect(tooltip).toBeVisible())
  },
}

export const Bottom: Story = {
  args: {
    side: 'bottom',
    content: 'Saved drafts are kept for 30 days.',
    children: <Button>Save draft</Button>,
  },
}
