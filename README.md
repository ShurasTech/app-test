# app-test

PWA de teste que envia mensagens direto para um webhook do Discord — sem
backend, sem conta, sem banco de dados. Serve também como validação de um
pipeline completo: PWA web + hospedagem pública própria (Traefik dedicado) +
deploy contínuo + build iOS via Capacitor gerando um `.ipa` instalável.

Planejamento completo (PRD, arquitetura, épicos/stories) em
`_bmad-output/planning-artifacts/` neste repo.

## Rodando localmente

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/
npm run preview   # serve o build de produção localmente
```

Nenhuma variável de ambiente é necessária para rodar localmente — a URL do
webhook do Discord é digitada na própria tela do app e fica salva só no
`localStorage` do seu navegador. **Nunca** coloque uma URL de webhook real em
código, `.env` ou qualquer arquivo do repositório.

## Como funciona o deploy

- **Hospedagem**: este repositório roda sua própria instância dedicada do
  Traefik (isolada do Traefik interno do homelab-infra), expondo publicamente
  apenas as portas 80 e 443 no IP público da VPS. TLS via Let's Encrypt
  (HTTP-01).
- **Convenção de deploy** (ADR-0005 do homelab-infra): o código vive em
  `/opt/projects/app-test` na VPS. O deploy contínuo faz `git fetch` + `git
  reset --hard origin/main` (nunca `actions/checkout`) seguido de `docker
  compose up -d --build`, rodando em um runner self-hosted registrado a nível
  de organização — sem segredos de SSH.
- **Setup manual (primeira vez)**:
  ```bash
  cd /opt/projects/app-test
  cp .env.example .env   # preencher PUBLIC_IP, DOMAIN, ACME_EMAIL
  docker compose up -d --build
  ```
- **Pré-requisito crítico**: antes do primeiro deploy, o Traefik interno do
  homelab-infra precisa estar bindado apenas ao IP do Tailscale (não a
  `0.0.0.0`), para não conflitar com a porta 443 pública que este projeto usa.

## Como gerar e instalar o .ipa

- O workflow `.github/workflows/ios-build.yml` builda o app iOS via
  Capacitor em um runner `macos` hospedado pelo GitHub, a cada push.
- O `.ipa` gerado **não é assinado** (sem conta paga de desenvolvedor Apple) e
  fica disponível como artifact na execução do workflow, no GitHub Actions.
- Para instalar no iPhone: baixe o `.ipa` do artifact e use
  [AltStore](https://altstore.io/) ou [SideStore](https://sidestore.io/) com
  um Apple ID gratuito.
- **Limitação conhecida**: apps assinados com Apple ID gratuito expiram em 7
  dias — será necessário reinstalar periodicamente.

## Stack

- Vite + TypeScript vanilla (sem framework) + `vite-plugin-pwa`
- Capacitor (`@capacitor/core`, `@capacitor/ios`) para o build iOS
- Traefik v3.7 (dedicado, isolado do homelab-infra)
- nginx (`nginx:1.27-alpine`) servindo os arquivos estáticos
- GitHub Actions (deploy contínuo + build iOS)

## Stack BMad

Este repositório usa a mesma stack de skills BMad do homelab-infra
(`.agents/skills/`, `_bmad/`), para dar continuidade ao planejamento e à
execução guiada por skills.
