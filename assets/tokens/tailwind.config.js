/**
 * Night Aperture — Tailwind token layer.
 *
 * This site is hand-written CSS with no build step; assets/site.css holds the
 * runtime tokens as custom properties. This file is the same token set in
 * Tailwind's shape, so the system can be lifted into a Tailwind project
 * without re-deriving it. assets/tokens/design-tokens.json is the same set
 * again in W3C DTCG format.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#0B0A12',
        surface: '#14121F',
        ink: { DEFAULT: '#F1EFF7', muted: '#A6A0BA' },
        accent: { DEFAULT: '#B9A8FF', hover: '#C9BCFF', credential: '#E0A458' },
        edge: { DEFAULT: '#625C8C', divider: '#221F33' },
        paper: { bg: '#F5F2EC', ink: '#16141F', muted: '#56506A', accent: '#5B44C4' },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: '0.8rem',
        sm: '1rem',
        base: 'clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',
        lg: '1.25rem',
        xl: '1.5625rem',
        '2xl': '1.953rem',
        '3xl': '2.441rem',
        '4xl': '3.052rem',
        display: 'clamp(2.75rem, 1.8rem + 4.5vw, 5rem)',
      },
      lineHeight: { display: '1.05', heading: '1.15', body: '1.6', prose: '1.7' },
      borderRadius: { control: '8px', card: '20px' },
      maxWidth: { container: '1200px', measure: '65ch' },
      transitionTimingFunction: { brand: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      transitionDuration: { fast: '150ms', base: '200ms', slow: '300ms' },
      spacing: { 30: '7.5rem' },
    },
  },
};
