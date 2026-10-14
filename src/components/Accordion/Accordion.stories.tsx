import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'
import { Accordion, AccordionItem } from './Accordion'

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  subcomponents: { AccordionItem },
  decorators: [
    (Story) => (
      <div className="w-[min(36rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  args: {
    children: [
      <AccordionItem key="shipping" value="shipping" title="How long does shipping take?">
        <p>Orders arrive within 3–5 working days in the UK, and 7–10 working days internationally.</p>
      </AccordionItem>,
      <AccordionItem key="returns" value="returns" title="Can I return an item?">
        <p>Yes. Return any unused item within 30 days for a full refund.</p>
      </AccordionItem>,
      <AccordionItem key="support" value="support" title="How do I contact support?">
        <p>Email us at any time and we'll reply within one working day.</p>
      </AccordionItem>,
    ],
  },
  parameters: {
    docs: {
      description: {
        component: [
          'Vertically stacked sections that expand and collapse, following the [WAI-ARIA accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/).',
          '',
          '| Key | Action |',
          '|---|---|',
          '| <kbd>Enter</kbd> / <kbd>Space</kbd> | Expands or collapses the focused section |',
          '| <kbd>↓</kbd> / <kbd>↑</kbd> | Moves focus to the next or previous header, wrapping round |',
          '| <kbd>Home</kbd> / <kbd>End</kbd> | Moves focus to the first or last header |',
          '',
          'Each header is a `<button>` inside a real heading (`headingLevel` sets the level to fit your page outline), with `aria-expanded` and `aria-controls`. Collapsed panels use `hidden`, so their content is out of the tab order and the accessibility tree.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Accordion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    const shipping = canvas.getByRole('button', { name: 'How long does shipping take?' })
    const returns = canvas.getByRole('button', { name: 'Can I return an item?' })
    const support = canvas.getByRole('button', { name: 'How do I contact support?' })

    await userEvent.click(shipping)
    await expect(shipping).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getByRole('region', { name: 'How long does shipping take?' })).toBeVisible()

    await userEvent.keyboard('{ArrowDown}')
    await expect(returns).toHaveFocus()
    await userEvent.keyboard('{End}')
    await expect(support).toHaveFocus()
    await userEvent.keyboard('{ArrowDown}')
    await expect(shipping).toHaveFocus()

    // Only one section is open at a time by default
    await userEvent.click(returns)
    await expect(returns).toHaveAttribute('aria-expanded', 'true')
    await expect(shipping).toHaveAttribute('aria-expanded', 'false')
  },
}

export const Multiple: Story = {
  args: { multiple: true, defaultValue: ['shipping', 'returns'] },
}
