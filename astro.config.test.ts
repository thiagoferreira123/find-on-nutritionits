import { describe, expect, it } from 'vitest'
import config from './astro.config.mjs'

describe('Astro security configuration', () => {
  it('trusts the configured public site when resolving reverse-proxy headers', () => {
    const site = new URL(String(config.site))

    expect(config.security?.allowedDomains).toEqual([
      {
        protocol: site.protocol.slice(0, -1),
        hostname: site.hostname,
        ...(site.port ? { port: site.port } : {}),
      },
    ])
  })
})
