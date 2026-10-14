import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Tab, TabList, TabPanel, Tabs } from './Tabs'

const panels = [
  { value: 'overview', label: 'Overview', body: 'A quick summary of your account and recent activity.' },
  { value: 'billing', label: 'Billing', body: 'Manage your payment method and download invoices.' },
  { value: 'team', label: 'Team', body: 'Invite people and choose what they can access.', disabled: true },
  { value: 'security', label: 'Security', body: 'Update your password and set up two-step verification.' },
]

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  subcomponents: { TabList, Tab, TabPanel },
  args: {
    defaultValue: 'overview',
    children: [
      <TabList key="list" label="Account settings">
        {panels.map(({ value, label, disabled }) => (
          <Tab key={value} value={value} disabled={disabled}>
            {label}
          </Tab>
        ))}
      </TabList>,
      ...panels.map(({ value, label, body }) => (
        <TabPanel key={value} value={value}>
          <h3 className="font-display font-semibold text-lg text-white">{label}</h3>
          <p className="mt-2">{body}</p>
        </TabPanel>
      )),
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[min(36rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component: [
          'Switches between panels of related content, following the [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) with automatic activation.',
          '',
          '| Key | Action |',
          '|---|---|',
          '| <kbd>Tab</kbd> | Moves focus into the tab list (to the selected tab), then on to the panel |',
          '| <kbd>←</kbd> / <kbd>→</kbd> | Selects the previous or next tab, wrapping round (<kbd>↑</kbd> / <kbd>↓</kbd> when vertical) |',
          '| <kbd>Home</kbd> / <kbd>End</kbd> | Selects the first or last tab |',
          '',
          'Only the selected tab is in the tab order (roving `tabindex`), so the list is a single <kbd>Tab</kbd> stop. Disabled tabs are skipped. Each tab is linked to its panel with `aria-controls` and `aria-labelledby`.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  play: async ({ canvas, userEvent }) => {
    const tab = (name: string) => canvas.getByRole('tab', { name })

    await userEvent.tab()
    await expect(tab('Overview')).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    await expect(tab('Billing')).toHaveAttribute('aria-selected', 'true')
    await expect(canvas.getByRole('tabpanel', { name: 'Billing' })).toBeVisible()

    // The disabled Team tab is skipped
    await userEvent.keyboard('{ArrowRight}')
    await expect(tab('Security')).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    await expect(tab('Overview')).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(tab('Security')).toHaveAttribute('aria-selected', 'true')

    // Tab leaves the tab list and moves to the panel
    await userEvent.tab()
    await expect(canvas.getByRole('tabpanel', { name: 'Security' })).toHaveFocus()
  },
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')

    await userEvent.tab()
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getByRole('tab', { name: 'Billing' })).toHaveFocus()
  },
}
