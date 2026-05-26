/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,js}'],
  theme: {
    extend: {
      colors: {
        shield: {
          deep: '#1a4a3a',
          mid: '#2d7a5f',
          light: '#e8f4f0',
          xlight: '#f0f8f5',
        },
        escape: '#c0392b',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
};
