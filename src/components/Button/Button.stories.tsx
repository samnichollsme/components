import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn } from 'storybook/test'
import { Button } from './Button'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Save changes', onClick: fn() },
  parameters: {
    docs: {
      description: {
        component: [
          'A native `<button>`, so keyboard support, focus and disabled state come from the browser.',
          '',
          '- Defaults to `type="button"` so it never submits a form by accident.',
          '- Every size is at least 32px tall, above the 24px minimum target size (WCAG 2.5.8).',
          '- Use `accent` sparingly, for the one action that matters most on a page.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Secondary: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: 'Save changes' })

    await userEvent.tab()
    await expect(button).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    await expect(args.onClick).toHaveBeenCalledTimes(2)
  },
}

export const Primary: Story = {
  args: { variant: 'primary' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Accent: Story = {
  args: { variant: 'accent' },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args} size="sm" />
      <Button {...args} size="md" />
      <Button {...args} size="lg" />
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.tab()
    await expect(canvas.getByRole('button')).not.toHaveFocus()
    await expect(args.onClick).not.toHaveBeenCalled()
  },
}
