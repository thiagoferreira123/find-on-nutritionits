# Encontre um Nutri

Microserviço público em Astro para descoberta de nutricionistas do DietSystem. O site entrega HTML renderizado no servidor para catálogo, páginas locais, especialidades, perfis, dúvidas e avaliações, consumindo os contratos públicos da API DietSystem.

## Desenvolvimento

Requer Node.js 22.12 ou superior.

```bash
npm ci
npm test
npm run build
```

Copie `.env.example` para `.env` somente no ambiente local. Nenhum segredo deve ser versionado.

## Produção

O `Dockerfile` gera um servidor Astro Node standalone na porta `4321`. O endpoint de saúde é `/health`. As variáveis mínimas são:

- `API_BASE_URL`
- `PUBLIC_SITE_URL`
- `PUBLIC_APP_URL`
- `PUBLIC_HCAPTCHA_SITE_KEY` quando CAPTCHA estiver habilitado na API

O deploy é gerenciado pelo Coolify a partir da branch `main`.
