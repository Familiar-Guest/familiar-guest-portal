import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdmin } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** List all registered owners with their property counts. */
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("owners")
    .select(`
      id,
      email,
      full_name,
      phone,
      created_at,
      commission_rate,
      subscription_amount,
      trial_expires_at,
      properties(id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin owners list failed", error);
    return NextResponse.json({ error: "Could not load owners." }, { status: 500 });
  }

  const owners = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    phone: row.phone,
    created_at: row.created_at,
    commission_rate: row.commission_rate,
    subscription_amount: row.subscription_amount,
    trial_expires_at: row.trial_expires_at,
    property_count: Array.isArray(row.properties) ? row.properties.length : 0,
  }));

  return NextResponse.json({ ok: true, owners });
}
