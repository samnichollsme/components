import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, waitFor } from 'storybook/test'
import { Button } from '../Button/Button'
import { Dialog, type DialogProps } from './Dialog'

type DialogDemoProps = Omit<DialogProps, 'open' | 'onOpenChange'> & { triggerLabel: string }

const DialogDemo = ({ triggerLabel, ...props }: DialogDemoProps) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog {...props} open={open} onOpenChange={setOpen} />
    </>
  )
}

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  args: {
    open: false,
    onOpenChange: fn(),
    title: 'Edit profile',
    description: 'Changes to your profile are visible to everyone on your team.',
  },
  parameters: {
    docs: {
      description: {
        component: [
          'A modal dialog built on the native `<dialog>` element, following the [WAI-ARIA dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).',
          '',
          '| Key | Action |',
          '|---|---|',
          '| <kbd>Tab</kbd> / <kbd>Shift</kbd> + <kbd>Tab</kbd> | Moves focus between elements inside the dialog. Focus can’t leave it. |',
          '| <kbd>Escape</kbd> | Closes the dialog |',
          '',
          '`showModal()` gives a real focus trap and makes the rest of the page inert, so screen readers can’t wander behind it. The dialog is named by its title and described by its description. Focus moves into the dialog on open (to the first focusable element, or one marked `data-autofocus`) and returns to the element that opened it on close.',
          '',
          'Use `role="alertdialog"` for confirmations that need a decision. It has no close button and ignores clicks outside.',
        ].join('\n'),
      },
    },
  },
  render: (args) => <DialogDemo {...args} triggerLabel="Edit profile" />,
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <label className="flex flex-col gap-2 font-medium text-sm text-white">
        Display name
        <input
          defaultValue="Sam Nicholls"
          className="rounded-xl border border-neutral-500 bg-neutral-950 px-4 py-2.5 font-normal text-white"
        />
      </label>
    ),
    actions: (
      <>
        <Button>Cancel</Button>
        <Button variant="primary">Save</Button>
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Edit profile' })
    await userEvent.click(trigger)

    const dialog = canvas.getByRole('dialog', { name: 'Edit profile' })
    await expect(dialog).toHaveAccessibleDescription('Changes to your profile are visible to everyone on your team.')
    await expect(canvas.getByRole('button', { name: 'Close' })).toHaveFocus()

    await userEvent.keyboard('{Escape}')
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toHaveFocus()

    // Reopen so the accessibility check runs against the open dialog, once its entrance animation finishes
    await userEvent.click(trigger)
    await waitFor(() => expect(canvas.getByRole('dialog')).toBeVisible())
  },
}

const ConfirmDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete project</Button>
      <Dialog
        role="alertdialog"
        size="sm"
        open={open}
        onOpenChange={setOpen}
        title="Delete this project?"
        description="This permanently deletes the project and all of its files. You can’t undo this."
        actions={
          <>
            <Button data-autofocus onClick={() => setOpen(false)}>
              Keep project
            </Button>
            <Button variant="accent" onClick={() => setOpen(false)}>
              Delete project
            </Button>
          </>
        }
      />
    </>
  )
}

export const Confirmation: Story = {
  render: () => <ConfirmDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Delete project' }))

    await waitFor(() => expect(canvas.getByRole('alertdialog', { name: 'Delete this project?' })).toBeVisible())
    // Focus starts on the least destructive action
    await expect(canvas.getByRole('button', { name: 'Keep project' })).toHaveFocus()
  },
}
