import { NextResponse } from "next/server";
import { Resend } from 'resend'

import sql from "../../../../lib/db";

export const maxDuration = 60;

const resend = new Resend(process.env.RESEND_API_KEY)

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHTML(summary, { dateLabel, unsubscribeEmail }) {
  const points = Array.isArray(summary?.points) ? summary.points : [];
  const safePoints = points.slice(0, 5).map((p) => ({
    text: escapeHtml(p?.text ?? ""),
    url: typeof p?.url === "string" && p.url ? p.url : null,
  }));

  const unsubscribeUrl = `https://noticias-pt.me/api/newsletter/unsubscribe?email=${encodeURIComponent(
    unsubscribeEmail
  )}`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Notícias PT — Resumo do Dia</title>
  </head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;">
    <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
      <div style="font-size:18px;font-weight:700;letter-spacing:-0.01em;">Notícias PT — Resumo do Dia</div>
      <div style="margin-top:6px;font-size:12px;color:#6b7280;">${escapeHtml(
        dateLabel
      )}</div>

      <ol style="margin:18px 0 0 18px;padding:0;font-size:14px;line-height:1.6;">
        ${safePoints
          .map((p) => {
            const content = p.url
              ? `<a href="${escapeHtml(
                  p.url
                )}" style="color:#111827;text-decoration:underline;text-underline-offset:3px;">${p.text}</a>`
              : p.text;
            return `<li style="margin:10px 0;">${content}</li>`;
          })
          .join("")}
      </ol>

      <div style="margin-top:22px;border-top:1px solid #e5e7eb;padding-top:14px;font-size:12px;color:#6b7280;">
        <div>Notícias PT • <a href="https://noticias-pt.me" style="color:#6b7280;text-decoration:underline;text-underline-offset:3px;">noticias-pt.me</a></div>
        <div style="margin-top:10px;">
          <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline;text-underline-offset:3px;">Remover da newsletter</a>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

async function getTodaySummary(request) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startIso = startOfToday.toISOString();

  const existingSummaries = await sql`
    select *
    from summaries
    where created_at >= ${startIso}
    order by created_at desc
    limit 1
  `;

  if (existingSummaries?.length) {
    const existingSummary = existingSummaries[0];
    let points = [];

    if (existingSummary?.points) {
      if (typeof existingSummary.points === "string") {
        try {
          points = JSON.parse(existingSummary.points);
        } catch {
          points = [];
        }
      } else if (Array.isArray(existingSummary.points)) {
        points = existingSummary.points;
      }
    }

    return { ...existingSummary, points };
  }

  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/api/summarize`, { method: "GET" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.summary) {
    throw new Error(data?.error ?? "Failed to generate summary");
  }
  return data.summary;
}

export async function GET(request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json({ error: "missing_resend_api_key" }, { status: 500 });
    }

    const summary = await getTodaySummary(request);
    const dateLabel = new Date().toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const subscribers = await sql`
      select email
      from newsletter_subscribers
      where coalesce(active, true) = true
    `;

    const list = Array.isArray(subscribers) ? subscribers : [];
    let sent = 0;
    let failed = 0;

    const dateString = dateLabel;

    const emailBatch = list
      .filter((subscriber) => typeof subscriber?.email === "string" && subscriber.email)
      .map((subscriber) => ({
        from: 'Notícias PT <resumo@noticias-pt.me>',
        to: subscriber.email,
        subject: 'Resumo do Dia — ' + dateString,
        html: buildEmailHTML(summary, {
          dateLabel,
          unsubscribeEmail: subscriber.email,
        }),
      }));

    const chunkArray = (arr, size) =>
      arr.reduce((chunks, item, i) => {
        if (i % size === 0) chunks.push([]);
        chunks[chunks.length - 1].push(item);
        return chunks;
      }, []);

    const chunks = chunkArray(emailBatch, 100);

    for (const chunk of chunks) {
      const { error } = await resend.batch.send(chunk);
      if (error) console.error("Batch send error:", error);
      if (!error) {
        sent += chunk.length;
      } else {
        failed += chunk.length;
      }
      if (chunks.length > 1) await new Promise((r) => setTimeout(r, 1000));
    }

    return NextResponse.json({ success: true, sent, failed });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message ?? "internal_error" },
      { status: 500 }
    );
  }
}

