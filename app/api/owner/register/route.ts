import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, siteUrl } from "@/lib/email";
import { buildOwnerRegistrationEmail } from "@/lib/emails/ownerRegistrationEmail";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const full_name = String(body.full_name ?? "").trim();
  const phone = String(body.phone ?? "").trim() || null;

  if (!full_name) return bad("Enter your name.");
  if (!EMAIL_RE.test(email)) return bad("Enter a valid email.");
  if (password.length < 8)
    return bad("Use a password of at least 8 characters.");

  const admin = createAdminClient();

  // Create the account already confirmed, so the owner can log in immediately.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createErr || !created.user) {
    const msg = createErr?.message ?? "";
    if (/already|registered|exists/i.test(msg))
      return bad("An account with that email already exists. Try logging in.", 409);
    console.error("createUser failed", createErr);
    return bad("Could not create your account. Please try again.", 500);
  }

  // Profile row with the extra fields.
  const { error: profileErr } = await admin.from("owners").insert({
    id: created.user.id,
    email,
    full_name,
    phone,
  });
  if (profileErr) {
    console.error("owner profile insert failed", profileErr);
    // Account exists in auth; surface a soft error but let them log in.
  }

  // Registration confirmation email (Tidewater template). Best-effort.
  {
    const { subject, html } = buildOwnerRegistrationEmail({
      ownerName: full_name.split(" ")[0] || full_name,
      ownerEmail: email,
      portalUrl: `${siteUrl()}/owner`,
    });
    await sendEmail({ to: email, subject, html });
  }

  // Sign them in (sets the session cookies).
  const supabase = await createClient();
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) {
    console.error("post-register sign-in failed", signInErr);
    return NextResponse.json(
      { ok: true, signedIn: false },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true, signedIn: true });
}

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}
