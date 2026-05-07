import sql from "../../../../lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = (searchParams.get("email") || "").trim();

  if (email) {
    try {
      await sql`
        update newsletter_subscribers
        set active = false
        where email = ${email}
      `;
    } catch {
      // Intentionally ignore DB errors to keep response simple.
    }
  }

  const html = `<!doctype html>
<html lang="pt-PT">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Newsletter — Notícias PT</title>
  </head>
  <body style="margin:0;padding:32px 16px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#ffffff;color:#111827;">
    <div style="max-width:600px;margin:0 auto;">
      <div style="font-size:18px;font-weight:700;letter-spacing:-0.01em;">Removido da newsletter com sucesso.</div>
      <div style="margin-top:12px;font-size:12px;color:#6b7280;">Notícias PT • noticias-pt.me</div>
    </div>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

