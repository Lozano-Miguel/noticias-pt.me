import SiteHeader from "../../components/SiteHeader";

export const dynamic = "force-static";

export const metadata = {
  title: "Sobre — Notícias PT",
  description:
    "O Notícias PT é um agregador gratuito de notícias portuguesas. Conheça o projeto, as fontes e quem o desenvolveu.",
};

export default function SobrePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Notícias PT",
      url: "https://noticias-pt.me",
      description:
        "O Notícias PT é um agregador gratuito de notícias portuguesas. Conheça o projeto, as fontes e quem o desenvolveu.",
      sameAs: ["https://github.com/Lozano-Miguel/noticias-pt.me"],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "O que é o Notícias PT?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Um agregador gratuito que centraliza artigos de mais de 30 fontes de informação portuguesas.",
          },
        },
        {
          "@type": "Question",
          name: "Como são recolhidas as notícias?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "As notícias são agregadas através dos feeds RSS e APIs públicas das principais publicações a operar em Portugal.",
          },
        },
        {
          "@type": "Question",
          name: "O serviço é pago?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Não. O Notícias PT é um projeto totalmente gratuito, sem publicidade e sem qualquer tipo de tracking de utilizadores.",
          },
        },
        {
          "@type": "Question",
          name: "Com que frequência é atualizada a plataforma?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "O nosso sistema sincroniza novos artigos de forma automática a cada 15 minutos.",
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-dvh">
      <SiteHeader />

      <main className="mx-auto w-full max-w-prose px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Sobre o Notícias PT
        </h1>

        <div className="mt-8 space-y-10">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              O Projeto
            </h2>
            <p className="text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
              O Notícias PT nasceu porque não encontrava nenhuma lista de RSS
              portuguesa decente. Em vez de ter de visitar dezenas de sites
              diariamente, decidi construir o meu próprio agregador.
            </p>
            <p className="text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
              Aqui encontras as principais notícias de Portugal num só lugar,
              atualizadas automaticamente a cada 15 minutos, para que possas
              acompanhar a atualidade nacional de forma rápida e centralizada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Funcionalidades
            </h2>
            <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-900 marker:text-zinc-400 dark:text-zinc-100 dark:marker:text-zinc-600">
              <li>Mais de 30 fontes de informação portuguesas agregadas automaticamente</li>
              <li>Filtros por categoria e publicação</li>
              <li>Resumo do Dia gerado por Inteligência Artificial</li>
              <li>Chat interativo sobre as notícias do dia</li>
              <li>Tópicos em destaque (Trending)</li>
              <li>Modo escuro e claro</li>
              <li>Totalmente gratuito, sem anúncios e sem rastreamento (tracking)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Fontes
            </h2>
            <p className="text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
              Agregamos os artigos das principais publicações nacionais,
              incluindo: RTP Notícias, Observador, Renascença, Correio da Manhã,
              Record, Jornal de Negócios, ECO, SAPO, Notícias ao Minuto e
              Público.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Código-Aberto
            </h2>
            <p className="text-base leading-relaxed text-zinc-900 dark:text-zinc-100">
              O Notícias PT é um projeto de código-aberto (open source). O
              código-fonte está disponível no GitHub, aberto a contribuições,
              feedback e sugestões da comunidade.
            </p>
            <a
              href="https://github.com/Lozano-Miguel/noticias-pt.me"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Ver repositório no GitHub
            </a>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Perguntas Frequentes
            </h2>

            <div className="rounded-lg border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    O que é o Notícias PT?
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Um agregador gratuito que centraliza artigos de mais de 30
                    fontes de informação portuguesas.
                  </dd>
                </div>

                <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Como são recolhidas as notícias?
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    As notícias são agregadas através dos feeds RSS e APIs
                    públicas das principais publicações a operar em Portugal.
                  </dd>
                </div>

                <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    O serviço é pago?
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Não. O Notícias PT é um projeto totalmente gratuito, sem
                    publicidade e sem qualquer tipo de tracking de utilizadores.
                  </dd>
                </div>

                <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <dt className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Com que frequência é atualizada a plataforma?
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    O nosso sistema sincroniza novos artigos de forma automática
                    a cada 15 minutos.
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
