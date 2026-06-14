import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { parsePropertyInput } from "@/lib/properties";
import type { Property } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Edit a property the owner owns. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }
  const parsed = parsePropertyInput(body);
  if ("error" in parsed) return bad(parsed.error);

  // Keep the slug stable on edit so shared listing URLs don't break.
  const { slug: _ignore, ...updates } = parsed.value;
  void _ignore;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .update(updates)
    .eq("id", id)
    .eq("owner_id", owner.id)
    .select()
    .single();

  if (error || !data) {
    console.error("property update failed", error);
    return bad("Could not update the property.", 500);
  }
  return NextResponse.json({ ok: true, property: data as Property });
}

/** Delete a property. Its bookings keep their snapshot (property_id set null). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);
  const { id } = await params;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("owner_id", owner.id);

  if (error) {
    console.error("property delete failed", error);
    return bad("Could not remove the property.", 500);
  }
  return NextResponse.json({ ok: true });
}
