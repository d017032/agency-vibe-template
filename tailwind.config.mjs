/** @type {import('tailwindcss').Config} */
export default {
    // This tells Tailwind to scan your Astro and React files for classes
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        // Your Vibe System handles colors, but you can add custom logic here later
      },
    },
    plugins: [],
  }