import { NextResponse } from "next/server";

import sql from "../../../../lib/db";

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const value = email.trim();
  if (!value) return false;
  if (value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const inserted = await sql`
      insert into newsletter_subscribers (email)
      values (${email})
      on conflict (email) do nothing
      returning email
    `;

    if (!inserted?.length) {
      return NextResponse.json({ success: true, message: "already_subscribed" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error?.message ?? "internal_error" },
      { status: 500 }
    );
  }
}
