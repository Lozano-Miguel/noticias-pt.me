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
CRON_SECRET=...
```

Gerar um valor seguro para `CRON_SECRET`:
```bash
openssl rand -hex 32
```

```bash
npm run dev
```

## Produção
O projeto corre como aplicação Node (por exemplo `npm run build` e `npm start` atrás de um reverse proxy num servidor Linux). A base de dados é PostgreSQL gerida no próprio servidor ou noutro host.

Tarefas periódicas típicas (via cron ou serviço externo):
- `GET /api/fetch-feeds` — atualizar feeds e ingerir artigos (ex.: cada 15 minutos).
- `POST /api/newsletter/send` — enviar resumo diário aos subscritores (ex.: diariamente).

Subscrições: `POST /api/newsletter/subscribe`; tabela `newsletter_subscribers`.

### Autenticação das rotas de cron

As rotas `/api/fetch-feeds` e `/api/newsletter/send` requerem um cabeçalho de autorização:

```
Authorization: Bearer <CRON_SECRET>
```

Exemplo com curl:
```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://noticias-pt.me/api/fetch-feeds
```

Se estiveres a usar um serviço externo como o [cron-job.org](https://cron-job.org), adiciona o cabeçalho nas definições do job:

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer <CRON_SECRET>` |

Rotas sem este cabeçalho retornam `401 Unauthorized`.

### Rate limiting

As rotas de IA têm limite por IP para proteger a quota da API:

| Rota | Limite |
|------|--------|
| `POST /api/chat` | 5 pedidos / minuto |
| `GET /api/summarize` | 10 pedidos / hora |

Pedidos acima do limite retornam `429 Too Many Requests`.

## Scripts
| Comando        | Descrição        |
|----------------|------------------|
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção |
| `npm start`    | Servidor de produção |
| `npm run lint` | ESLint           |

## Licença
MIT