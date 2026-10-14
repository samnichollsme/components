import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor } from 'storybook/test'
import { Combobox, type ComboboxOption } from './Combobox'

const countries: ComboboxOption[] = [
  'Australia',
  'Canada',
  'France',
  'Germany',
  'Ireland',
  'Italy',
  'Japan',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Spain',
  'Sweden',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
].map((name) => ({ value: name.toLowerCase().replaceAll(' ', '-'), label: name }))

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  args: {
    label: 'Country',
    placeholder: 'Start typing a country',
    options: countries,
    onValueChange: fn(),
  },
  decorators: [
    (Story) => (
      <div className="h-96 w-[min(22rem,calc(100vw-2rem))]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'A text input with a filtered list of suggestions, following the [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) with list autocomplete.',
          '',
          '| Key | Action |',
          '|---|---|',
          '| Typing | Filters the options and opens the list |',
          '| <kbd>↓</kbd> / <kbd>↑</kbd> | Opens the list, or moves through the options, skipping disabled ones |',
          '| <kbd>Alt</kbd> + <kbd>↓</kbd> / <kbd>↑</kbd> | Opens or closes the list without moving the highlight |',
          '| <kbd>Enter</kbd> | Selects the highlighted option |',
          '| <kbd>Escape</kbd> | Closes the list, or clears the input if it’s already closed |',
          '',
          'Focus stays in the input the whole time. `aria-activedescendant` tells screen readers which option is highlighted, and a polite live region announces how many results match as you type. Leaving the field restores the last valid selection, so it never ends up holding text that isn’t an option.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole('combobox', { name: 'Country' })

    await userEvent.click(input)
    await userEvent.keyboard('united')
    await expect(input).toHaveAttribute('aria-expanded', 'true')
    await expect(canvas.getAllByRole('option')).toHaveLength(3)
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('3 results available'))

    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    const highlighted = canvas.getByRole('option', { name: 'United Kingdom' })
    await expect(input).toHaveAttribute('aria-activedescendant', highlighted.id)

    await userEvent.keyboard('{Enter}')
    await expect(input).toHaveValue('United Kingdom')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await expect(args.onValueChange).toHaveBeenLastCalledWith('united-kingdom')

    // Reopening shows every option and highlights the current selection
    await userEvent.keyboard('{ArrowDown}')
    await expect(canvas.getAllByRole('option')).toHaveLength(countries.length)
    await expect(input).toHaveAttribute('aria-activedescendant', highlighted.id)

    await userEvent.keyboard('{Escape}')
    await expect(input).toHaveAttribute('aria-expanded', 'false')
  },
}

export const NoResults: Story = {
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox')
    await userEvent.click(input)
    await userEvent.keyboard('Atlantis')

    await expect(input).toHaveAttribute('aria-expanded', 'false')
    await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('No results found'))

    // Blurring with invalid text falls back to the previous (empty) selection
    await userEvent.tab()
    await expect(input).toHaveValue('')
  },
}

export const WithDisabledOptions: Story = {
  args: {
    label: 'Delivery slot',
    placeholder: 'Choose a time',
    description: 'Greyed-out slots are fully booked.',
    options: [
      { value: 'morning', label: 'Morning (8am – 12pm)' },
      { value: 'afternoon', label: 'Afternoon (12pm – 4pm)', disabled: true },
      { value: 'evening', label: 'Evening (4pm – 8pm)' },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('combobox', { name: 'Delivery slot' })
    await expect(input).toHaveAccessibleDescription('Greyed-out slots are fully booked.')

    await userEvent.click(input)
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await expect(input).toHaveAttribute(
      'aria-activedescendant',
      canvas.getByRole('option', { name: 'Evening (4pm – 8pm)' }).id,
    )
  },
}

export const Preselected: Story = {
  args: { defaultValue: 'japan' },
}
