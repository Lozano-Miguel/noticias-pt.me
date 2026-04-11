import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Notícias PT — Agregador de Notícias Portuguesas",
  description:
    "Todas as notícias de Portugal num só lugar. Últimas horas, política, economia, desporto, cultura e muito mais agregadas das principais fontes portuguesas.",
  keywords:
    "notícias portugal, últimas notícias, jornal online, notícias ao minuto, rtp, observador, correio da manhã, política, desporto, economia",
  authors: [{ name: "Notícias PT" }],
  metadataBase: new URL("https://noticias-pt.me"),
  openGraph: {
    title: "Notícias PT — Agregador de Notícias Portuguesas",
    description: "Todas as notícias de Portugal num só lugar.",
    url: "https://noticias-pt.me",
    siteName: "Notícias PT",
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Notícias PT — Agregador de Notícias Portuguesas",
    description: "Todas as notícias de Portugal num só lugar.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      return;
    }
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      return;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();`,
          }}
        />
      </head>
      <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
