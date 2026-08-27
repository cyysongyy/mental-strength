import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/mental-strength/',
  plugins: [react()],
  build: {
    // Vite's default target can be newer than some users' browsers (e.g.
    // older iOS Safari), producing a JS bundle that fails to parse at all -
    // the entire script never runs, leaving #root permanently empty no
    // matter how many times the page is reloaded. Target a conservative,
    // widely-supported baseline instead.
    target: ['es2018', 'safari13'],
  },
})
