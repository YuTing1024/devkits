import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'DevKits — Developer Tools',
    description: 'Fast, private developer tools. JSON formatter, Base64, UUID generator and more.',
    permissions: [],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
