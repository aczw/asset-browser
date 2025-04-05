import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(), 
    tailwind({
      // Use existing CSS files
      applyBaseStyles: false,
    })
  ],
  // Enable verbose logging for debugging
  vite: {
    logLevel: 'info',
    define: {
      'process.env': process.env,
    }
  }
});
