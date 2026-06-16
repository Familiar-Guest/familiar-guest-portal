import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Get a single owner's full profile (including their properties). */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: owner, error: ownerErr } = await supabase
    .from("owners")
    .select("id, email, full_name, phone, created_at, commission_rate, subscription_amount, trial_expires_at")
    .eq("id", id)
    .single();

  if (ownerErr || !owner) {
    return NextResponse.json({ error: "Owner not found." }, { status: 404 });
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("id, name, location, is_listed, created_at")
    .eq("owner_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ ok: true, owner, properties: properties ?? [] });
}

/** Update admin-editable fields on an owner profile. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if ("commission_rate" in body) {
    const v = body.commission_rate === null || body.commission_rate === ""
      ? null
      : Number(body.commission_rate);
    updates.commission_rate = v === null || !Number.isFinite(v) ? null : v;
  }
  if ("subscription_amount" in body) {
    const v = body.subscription_amount === null || body.subscription_amount === ""
      ? null
      : Number(body.subscription_amount);
    updates.subscription_amount = v === null || !Number.isFinite(v) ? null : v;
  }
  if ("trial_expires_at" in body) {
    const v = body.trial_expires_at;
    updates.trial_expires_at = (v === null || v === "") ? null : String(v);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("owners")
    .update(updates)
    .eq("id", id)
    .select("id, email, full_name, phone, created_at, commission_rate, subscription_amount, trial_expires_at")
    .single();

  if (error || !data) {
    console.error("admin owner update failed", error);
    return NextResponse.json({ error: "Could not update owner." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, owner: data });
}
