import { execSync } from 'node:child_process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Stamped into the bundle at build time so the running app can show which
// build it actually is - the point being to tell "the update shipped" apart
// from "my browser is still serving a cached older bundle", which is not
// something a hand-maintained version constant can answer.
function buildCommit(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7)
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/mental-strength/',
  plugins: [react()],
  define: {
    __BUILD_COMMIT__: JSON.stringify(buildCommit()),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    // Vite's default target can be newer than some users' browsers (e.g.
    // older iOS Safari), producing a JS bundle that fails to parse at all -
    // the entire script never runs, leaving #root permanently empty no
    // matter how many times the page is reloaded. Target a conservative,
    // widely-supported baseline instead.
    target: ['es2018', 'safari13'],
  },
})
