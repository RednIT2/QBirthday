// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://RednIT2.github.io', // Github Pages URL
  base: '/QBirthday', // Tên Repository trên Github của bạn (đã cập nhật theo repo của bạn)
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [react()]
});