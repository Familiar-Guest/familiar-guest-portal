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
    .select("full_name, public_name, handle")
    .eq("id", owner.id)
    .single();
  const row = data as { full_name: string | null; public_name: string | null; handle: string | null } | null;
  if (!row) return NextResponse.json({ error: "Owner not found." }, { status: 404 });

  return NextResponse.json({
    ok: true,
    full_name: row.full_name,
    public_name: row.public_name,
    handle: row.handle,
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
  const result = await setOwnerPublicName(owner.id, public_name);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 500 });

  return NextResponse.json({ ok: true, public_name, handle: result.handle });
}
