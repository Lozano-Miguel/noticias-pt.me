# Notícias PT

Agregador de notícias portuguesas: feeds RSS, pesquisa, categorias, resumo do dia e chat com contexto das últimas manchetes. Site em produção: [noticias-pt.me](https://noticias-pt.me).

## Stack

Next.js (App Router), React, Tailwind CSS, PostgreSQL (`postgres` driver), Groq (resumos/chat), Resend (newsletter), `rss-parser`.

## Requisitos

- Node.js (versão compatível com Next 16)
- Base de dados PostgreSQL

## Arranque local

```bash
git clone https://github.com/Lozano-Miguel/noticias-pt.me.git
cd noticias-pt.me
npm install
```

Criar `.env.local` na raiz:

```env
DATABASE_URL=postgresql://...
GROQ_API_KEY=...
RESEND_API_KEY=...
```

```bash
npm run dev
```

## Produção

O projeto corre como aplicação Node (por exemplo `npm run build` e `npm start` atrás de um reverse proxy num servidor Linux). A base de dados é PostgreSQL gerida no próprio servidor ou noutro host.

Tarefas periódicas típicas (via cron ou serviço externo):

- `GET /api/fetch-feeds` — atualizar feeds e ingerir artigos (ex.: cada 15 minutos).
- `GET /api/newsletter/send` — enviar resumo diário aos subscritores (ex.: diariamente).

Subscrições: `POST /api/newsletter/subscribe`; tabela `newsletter_subscribers`.

## Scripts

| Comando        | Descrição        |
|----------------|------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção |
| `npm start`    | Servidor de produção |
| `npm run lint` | ESLint           |

## Licença

MIT
