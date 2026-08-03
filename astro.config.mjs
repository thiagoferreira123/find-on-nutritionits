import node from '@astrojs/node'
import { defineConfig } from 'astro/config'

const site = process.env.PUBLIC_SITE_URL ?? 'https://encontre-um-nutri.dietsystem.com.br'
const siteUrl = new URL(site)

export default defineConfig({
  site,
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: true, port: 4321 },
  security: {
    allowedDomains: [{
      protocol: siteUrl.protocol.slice(0, -1),
      hostname: siteUrl.hostname,
      ...(siteUrl.port ? { port: siteUrl.port } : {}),
    }],
  },
  compressHTML: true,
})
