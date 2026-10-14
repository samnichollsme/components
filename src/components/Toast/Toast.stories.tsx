import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
import { Button } from '../Button/Button'
import { type ToastOptions, ToastProvider, useToast } from './Toast'

type ToastDemoProps = ToastOptions & { triggerLabel: string }

const ToastDemo = ({ triggerLabel, ...options }: ToastDemoProps) => {
  const { toast } = useToast()
  return (
    <Button variant="primary" onClick={() => toast(options)}>
      {triggerLabel}
    </Button>
  )
}

const meta = {
  title: 'Components/Toast',
  component: ToastDemo,
  args: {
    triggerLabel: 'Save changes',
    title: 'Changes saved',
    description: 'Your profile has been updated.',
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      story: { inline: false, height: '320px' },
      description: {
        component: [
          'Brief, non-blocking notifications. Wrap your app in `ToastProvider`, then call `toast()` from `useToast()`.',
          '',
          '| Key | Action |',
          '|---|---|',
          '| <kbd>F8</kbd> | Moves focus to the notifications region |',
          '| <kbd>Tab</kbd> | Moves between toast actions and dismiss buttons |',
          '',
          '- **Announced, not focused.** Toasts are added to a polite live region, so screen readers read them out without interrupting what the user is doing.',
          '- **Time to read (WCAG 2.2.1).** Timers pause while the pointer is over the region or focus is inside it, and resume with the time that was left.',
          '- **Actions never vanish.** A toast with an action stays until it is dismissed, so keyboard and screen reader users have time to reach it.',
          '- **Focus is never lost.** Dismissing a focused toast moves focus to the region instead of the page body.',
        ].join('\n'),
      },
    },
  },
  render: (args) => (
    <div className="grid min-h-80 place-items-center">
      <ToastDemo {...args} />
    </div>
  ),
} satisfies Meta<typeof ToastDemo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }))

    const region = canvas.getByRole('region', { name: 'Notifications (F8)' })
    const toast = await canvas.findByRole('listitem', { name: 'Changes saved' })
    await expect(toast).toHaveAccessibleDescription('Your profile has been updated.')
    await expect(region.querySelector('[aria-live="polite"]')).toContainElement(toast)

    await userEvent.keyboard('{F8}')
    await userEvent.tab()
    await expect(canvas.getByRole('button', { name: 'Dismiss notification' })).toHaveFocus()

    await userEvent.keyboard('{Enter}')
    await waitFor(() => expect(toast).not.toBeInTheDocument())
  },
}

export const WithAction: Story = {
  args: {
    triggerLabel: 'Archive email',
    title: 'Email archived',
    description: undefined,
    action: { label: 'Undo', onClick: fn() },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Archive email' }))
    await userEvent.click(await canvas.findByRole('button', { name: 'Undo' }))

    await expect(args.action?.onClick).toHaveBeenCalled()
    await waitFor(() => expect(canvas.queryByRole('listitem')).not.toBeInTheDocument())
  },
}

export const AutoDismiss: Story = {
  args: { duration: 1000 },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save changes' }))
    const toast = await canvas.findByRole('listitem')

    await waitFor(() => expect(toast).not.toBeInTheDocument(), { timeout: 3000 })
  },
}
