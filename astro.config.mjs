import node from '@astrojs/node'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://encontre-um-nutri.dietsystem.com.br',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  compressHTML: true,
})
