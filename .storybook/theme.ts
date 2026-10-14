import { create } from 'storybook/theming'

// Matches the portfolio: near-black, neutral greys and a single orange accent
export const theme = create({
  base: 'dark',

  brandTitle: 'Sam Nicholls · Components',
  brandUrl: 'https://samnicholls.me',
  brandTarget: '_self',

  colorPrimary: '#ff7a45',
  colorSecondary: '#ff7a45',

  appBg: '#0a0a0a',
  appContentBg: '#0a0a0a',
  appPreviewBg: '#0a0a0a',
  appBorderColor: 'rgba(255, 255, 255, 0.1)',
  appBorderRadius: 12,

  fontBase: '"Inter", ui-sans-serif, system-ui, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, monospace',

  textColor: '#d4d4d4',
  textInverseColor: '#0a0a0a',
  textMutedColor: '#a3a3a3',

  barBg: '#171717',
  barTextColor: '#a3a3a3',
  barSelectedColor: '#ff7a45',
  barHoverColor: '#ff7a45',

  inputBg: '#171717',
  inputBorder: 'rgba(255, 255, 255, 0.15)',
  inputTextColor: '#ffffff',
  inputBorderRadius: 8,
})
