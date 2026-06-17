import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { setOwnerPublicName } from "@/lib/owner";
import { slugify } from "@/lib/properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Get the owner's profile settings. */
export async function GET() {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("owners")
    .select("full_name, public_name, handle, welcome_message_html, contact_email, contact_phone, contact_whatsapp")
    .eq("id", owner.id)
    .single();
  const row = data as {
    full_name: string | null;
    public_name: string | null;
    handle: string | null;
    welcome_message_html: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    contact_whatsapp: string | null;
  } | null;
  if (!row) return NextResponse.json({ error: "Owner not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    full_name: row.full_name,
    public_name: row.public_name,
    handle: row.handle,
    welcome_message_html: row.welcome_message_html,
    contact_email: row.contact_email ?? owner.email,
    contact_phone: row.contact_phone,
    contact_whatsapp: row.contact_whatsapp,
    default_public_name: row.full_name ? slugify(row.full_name).split("-").join(" ") : "",
  });
}

/** Update the owner's public display name (used in their listing URL). */
export async function PATCH(request: NextRequest) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const public_name = String(body.public_name ?? "").trim() || null;
  const welcome_message_html = "welcome_message_html" in body
    ? (String(body.welcome_message_html ?? "").trim() || null)
    : undefined;

  // Contact info shared with guests. Email is required if any contact field is sent.
  const contactKeys = ["contact_email", "contact_phone", "contact_whatsapp"];
  const hasContact = contactKeys.some((k) => k in body);
  const contact_email = "contact_email" in body ? String(body.contact_email ?? "").trim() : undefined;
  const contact_phone = "contact_phone" in body ? (String(body.contact_phone ?? "").trim() || null) : undefined;
  const contact_whatsapp = "contact_whatsapp" in body ? (String(body.contact_whatsapp ?? "").trim() || null) : undefined;

  if (contact_email !== undefined) {
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!EMAIL_RE.test(contact_email)) {
      return NextResponse.json({ error: "Enter a valid contact email." }, { status: 400 });
    }
  }

  const result = await setOwnerPublicName(owner.id, public_name);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 500 });

  const updates: Record<string, unknown> = {};
  if (welcome_message_html !== undefined) updates.welcome_message_html = welcome_message_html;
  if (contact_email !== undefined) updates.contact_email = contact_email;
  if (contact_phone !== undefined) updates.contact_phone = contact_phone;
  if (contact_whatsapp !== undefined) updates.contact_whatsapp = contact_whatsapp;
  if (Object.keys(updates).length > 0 || hasContact) {
    const admin = createAdminClient();
    await admin.from("owners").update(updates).eq("id", owner.id);
  }

  return NextResponse.json({ ok: true, public_name, handle: result.handle });
}
