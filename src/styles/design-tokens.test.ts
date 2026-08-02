import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./global.css', import.meta.url), 'utf8')

describe('DietSystem design tokens', () => {
  it.each([
    '--color-pri: #4ad395;',
    '--color-pri-hover: #3ec487;',
    '--color-fg: oklch(0.15 0.02 250);',
    '--color-page: #f5f6f7;',
    '--color-surface: #ffffff;',
    '--color-pri-light: #f0fdf8;',
    '--font-family-sans: "Mulish", system-ui, sans-serif;',
    '--radius-md: 8px;',
    '--radius-lg: 10px;',
    '--shadow-md: 0 4px 12px -1px rgb(0 0 0 / 0.06), 0 2px 4px -1px rgb(0 0 0 / 0.03);',
  ])('keeps the web token %s', (token) => {
    expect(css).toContain(token)
  })
})
