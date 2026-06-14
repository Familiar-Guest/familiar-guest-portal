import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { parsePropertyInput } from "@/lib/properties";
import type { Property } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** List the owner's properties. */
export async function GET() {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", owner.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("properties list failed", error);
    return NextResponse.json({ error: "Could not load properties." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, properties: (data ?? []) as Property[] });
}

/** Create a property. */
export async function POST(request: NextRequest) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parsePropertyInput(body);
  if ("error" in parsed)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("properties")
    .insert({ owner_id: owner.id, ...parsed.value })
    .select()
    .single();

  if (error || !data) {
    console.error("property insert failed", error);
    return NextResponse.json({ error: "Could not save the property." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, property: data as Property });
}
