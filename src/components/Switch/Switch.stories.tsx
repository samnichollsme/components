import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Switch } from './Switch'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Email notifications', onCheckedChange: fn() },
  parameters: {
    docs: {
      description: {
        component: [
          'An on/off control following the [WAI-ARIA switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).',
          '',
          '| Key | Action |',
          '|---|---|',
          '| <kbd>Tab</kbd> | Moves focus to the switch |',
          '| <kbd>Space</kbd> / <kbd>Enter</kbd> | Toggles the switch |',
          '',
          'It is a `<button role="switch">` with `aria-checked`. The visible `<label>` names it and can be clicked to toggle it, and the optional description is linked with `aria-describedby`. The off-state track uses a border with at least 3:1 contrast (WCAG 1.4.11).',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const toggle = canvas.getByRole('switch', { name: 'Email notifications' })
    await expect(toggle).not.toBeChecked()

    await userEvent.click(canvas.getByText('Email notifications'))
    await expect(toggle).toBeChecked()

    await userEvent.keyboard(' ')
    await expect(toggle).not.toBeChecked()
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false)
  },
}

export const WithDescription: Story = {
  args: {
    label: 'Reduce motion',
    description: 'Turns off non-essential animations across the app.',
    defaultChecked: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('switch')).toHaveAccessibleDescription(
      'Turns off non-essential animations across the app.',
    )
  },
}

export const Disabled: Story = {
  args: { disabled: true },
}
