import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind'; // <--- Must be here

export default defineConfig({
  integrations: [
    react(), 
    tailwind() // <--- Must be here
  ],
});