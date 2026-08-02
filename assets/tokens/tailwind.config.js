/**
 * Editorial direction — Tailwind token layer.
 *
 * The site is hand-written CSS with no build step; assets/site.css holds the
 * runtime tokens as custom properties. This file is the same set in Tailwind's
 * shape so the system can be lifted into a Tailwind project without being
 * re-derived. assets/tokens/design-tokens.json is the same set again in W3C
 * DTCG format, and carries the measured contrast ratios.
 */
module.exports = {
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#F2F0EA', raised: '#E9E6DE' },
        ink: { DEFAULT: '#14121B', muted: '#56506A' },
        accent: { DEFAULT: '#5B44C4', hover: '#4733A8' },
        dark: { DEFAULT: '#14121F', deep: '#0B0A12', ink: '#F1EFF7', muted: '#A6A0BA', accent: '#B9A8FF' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        label: ['0.6875rem', { letterSpacing: '0.1em' }],
        small: '0.9375rem',
        body: '1.0625rem',
        lead: ['clamp(1.375rem, 1rem + 1.9vw, 2.75rem)', { lineHeight: '1.18', letterSpacing: '-0.024em' }],
        h3: ['clamp(1.375rem, 1.2rem + 0.8vw, 1.75rem)', { lineHeight: '1.15', letterSpacing: '-0.028em' }],
        h2: ['clamp(2rem, 1.3rem + 3.4vw, 3.75rem)', { lineHeight: '1.02', letterSpacing: '-0.038em' }],
        display: ['clamp(3rem, 1.6rem + 7vw, 7.5rem)', { lineHeight: '0.9', letterSpacing: '-0.045em' }],
      },
      letterSpacing: {
        display: '-0.045em',
        h2: '-0.038em',
        h3: '-0.028em',
        lead: '-0.024em',
        label: '0.1em',
      },
      lineHeight: { display: '0.9', h2: '1.02', lead: '1.18', body: '1.6', prose: '1.7' },
      borderRadius: { DEFAULT: '6px', pill: '999px' },
      maxWidth: { container: '1240px', measure: '62ch' },
      transitionTimingFunction: { brand: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      transitionDuration: { fast: '180ms', base: '260ms', slow: '620ms' },
      backdropBlur: { nav: '20px' },
    },
  },
};
