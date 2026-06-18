import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { getOwnerPolicies, parsePolicyInput } from "@/lib/policies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The owner's global rental policies (defaults until they save their own). */
export async function GET() {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const admin = createAdminClient();
  const policy = await getOwnerPolicies(admin, owner.id);
  return NextResponse.json({ ok: true, policy });
}

/** Save the owner's global rental policies. */
export async function PATCH(request: NextRequest) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parsePolicyInput(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("owner_policies")
    .upsert(
      { owner_id: owner.id, ...parsed.value, updated_at: new Date().toISOString() },
      { onConflict: "owner_id" }
    );
  if (error) {
    console.error("policy upsert failed", error);
    return NextResponse.json({ error: "Could not save your policies." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, policy: parsed.value });
}
