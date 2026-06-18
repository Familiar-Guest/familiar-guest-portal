import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { buildGuestRegistrationEmail } from "@/lib/emails/guestRegistrationEmail";
import { ensureGuestPortal, guestPortalUrl } from "@/lib/guestPortal";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const full_name = String(body.full_name ?? "").trim();
  const phone = String(body.phone ?? "").trim() || null;

  if (!full_name) return bad("Enter your name.");
  if (!EMAIL_RE.test(email)) return bad("Enter a valid email.");
  if (password.length < 8) return bad("Use a password of at least 8 characters.");

  const admin = createAdminClient();
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, phone },
  });
  if (createErr || !created.user) {
    const msg = createErr?.message ?? "";
    if (/already|registered|exists/i.test(msg))
      return bad("An account with that email already exists. Try signing in.", 409);
    console.error("guest createUser failed", createErr);
    return bad("Could not create your account. Please try again.", 500);
  }

  await admin.from("guests").insert({
    id: created.user.id,
    email,
    full_name,
    phone,
  });

  // Permanent, no-login portal token, then the registration email linking to it.
  const token = await ensureGuestPortal(email, admin);
  const { subject, html } = buildGuestRegistrationEmail({
    guestName: full_name.split(" ")[0] || full_name,
    guestEmail: email,
    portalUrl: guestPortalUrl(token),
  });
  await sendEmail({ to: email, subject, html });

  // Sign them in (sets session cookies).
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signInErr) return NextResponse.json({ ok: true, signedIn: false });

  return NextResponse.json({ ok: true, signedIn: true });
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}
