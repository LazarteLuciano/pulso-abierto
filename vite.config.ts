import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vite.dev/config/ — https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom simula el navegador (DOM y localStorage) dentro de Node.
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Antes de cada prueba: se restaura fetch y se reinician las funciones simuladas.
    unstubGlobals: true,
    mockReset: true,
  },
});
