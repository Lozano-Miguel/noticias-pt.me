# Notícias PT

Notícias PT é um agregador de notícias português construído com Next.js, Tailwind CSS e PostgreSQL. A plataforma centraliza artigos de mais de 30 fontes nacionais, oferecendo filtros inteligentes, tópicos em destaque, resumos gerados por IA e uma experiência de chat interativa.

## Live

https://noticias-pt.me

---

# 🚀 Funcionalidades

## Agregação Automática

- Sincronização de mais de 30 feeds RSS portugueses
- Atualização automática a cada 15 minutos
- Ingestão contínua de novos artigos

## Filtros Inteligentes

- Navegação por categorias:
  - Política
  - Desporto
  - Economia
  - Tecnologia
  - Cultura
  - Saúde
  - Mundo
  - Opinião

- Navegação por fonte:
  - Observador
  - RTP
  - Público
  - SIC Notícias
  - CNN Portugal
  - Expresso
  - ECO
  - TSF
  - Jornal de Notícias
  - A Bola
  - Record
  - Entre outras

## Pesquisa Full-text

- Pesquisa rápida em todo o histórico recente
- Resultados otimizados por relevância
- Indexação eficiente em PostgreSQL

## Resumo do Dia

- Briefing diário automático
- Resumos gerados via Groq API
- Destaques das notícias mais relevantes do dia

## AI Chat

- Assistente virtual contextual
- Responde perguntas sobre notícias recentes
- Conversação baseada em conteúdo atualizado

## Deduplicação Inteligente

- Agrupamento de artigos semelhantes
- Redução de conteúdo repetido
- Melhor experiência de leitura

## Newsletter

- Subscrição simplificada
- Toast flutuante de registo
- Envio automático diário via Resend

## Experiência do Utilizador

- Infinite Scroll
- Dark / Light mode automático
- Interface mobile-first
- PWA Ready
- Performance otimizada
- UI responsiva

## Página Sobre (/sobre)

Inclui:

- Informações detalhadas sobre o projeto
- FAQ interativo
- Metadata SEO avançada
- JSON-LD Organization
- JSON-LD FAQPage

---

# 🛠️ Tech Stack

| Tecnologia | Função |
|---|---|
| Next.js | Framework React para SSR e roteamento |
| Tailwind CSS | Estilização utilitária e interface responsiva |
| PostgreSQL | Base de dados central |
| Groq API | IA para resumos e chat |
| Resend API | Serviço de newsletters |
| Cron-job.org | Agendamento de automações |

---

# 📦 Estrutura do Projeto

```bash
app/
├── api/
├── sobre/
├── page.tsx

components/
├── Cards/
├── Chat/
├── Trending/
├── Newsletter/

lib/
├── db/
├── feeds/
├── deduplication/
├── ai/

public/
```

## Descrição

### app/

Rotas da aplicação, páginas e endpoints API.

### components/

Componentes reutilizáveis da interface.

### lib/

Lógica backend:

- Fetching de feeds
- PostgreSQL
- Processamento IA
- Deduplicação
- Gestão de fontes

### public/

Assets estáticos e recursos públicos.

---

# ⚙️ Configuração Local

## Clonar Repositório

```bash
git clone https://github.com/seu-utilizador/noticias-pt.git

cd noticias-pt
```

## Instalar Dependências

```bash
npm install
```

## Variáveis de Ambiente

Criar ficheiro `.env.local` na raiz do projeto:

```env
DATABASE_URL=seu_postgres_connection_string

GROQ_API_KEY=sua_chave_groq

RESEND_API_KEY=sua_chave_resend
```

## Executar em Desenvolvimento

```bash
npm run dev
```

---

# 📧 Newsletter e Automação

## Newsletter Subscribers

O projeto gere subscrições através da tabela:

```sql
newsletter_subscribers
```

---

## Endpoints

### Registo de Subscrição

```http
POST /api/newsletter/subscribe
```

Responsável por:

- Registar novos utilizadores
- Validar emails
- Guardar subscritores ativos

---

### Envio do Resumo Diário

```http
GET /api/newsletter/send
```

Responsável por:

- Gerar o resumo diário
- Enviar emails automáticos
- Distribuir newsletters aos subscritores

### Recomendação

Agendar diariamente às:

```txt
08:00
```

---

### Fetch de Notícias

```http
GET /api/fetch-feeds
```

Responsável por:

- Atualizar feeds RSS
- Inserir novos artigos
- Limpar registos antigos
- Executar deduplicação

### Recomendação

Executar a cada:

```txt
15 minutos
```

---

# 🤖 Funcionalidades IA

## Resumos Automáticos

- Processamento via Groq API
- Síntese automática de notícias
- Organização contextual

## Chat Inteligente

- Perguntas e respostas sobre notícias
- Contexto atualizado em tempo real
- Interface conversacional

## Organização de Conteúdo

- Agrupamento semântico
- Deduplicação automática
- Priorização de relevância

---

# 🔍 SEO

O projeto inclui:

- Metadata dinâmica
- Open Graph
- Twitter Cards
- JSON-LD
- Organization Schema
- FAQ Schema
- Sitemap dinâmica
- Robots.txt
- URLs otimizadas
- Estrutura preparada para indexação

---

# 📱 PWA

Notícias PT está preparado para funcionar como Progressive Web App.

Inclui:

- Instalação em dispositivos móveis
- Experiência app-like
- Cache otimizada
- Performance mobile

---

# 📊 Performance

- SSR otimizado
- Lazy loading
- Infinite scroll
- Compressão de assets
- Queries otimizadas
- Cache de requests
- Atualizações incrementais

---

# 🔐 Segurança

- Validação de inputs
- Proteção de endpoints
- Sanitização de conteúdo
- Gestão segura de variáveis ambiente

---

# 📄 Licença

MIT License

---

# 👨‍💻 Desenvolvimento

## Scripts

### Desenvolvimento

```bash
npm run dev
```

### Build Produção

```bash
npm run build
```

### Produção

```bash
npm start
```

### Lint

```bash
npm run lint
```

---

# 🌐 Deploy

Recomendado:

- Vercel
- Railway
- Neon PostgreSQL
- Supabase
- Docker

---

# 📬 Contacto

Projeto focado em centralizar notícias portuguesas numa experiência rápida, moderna e inteligente.
