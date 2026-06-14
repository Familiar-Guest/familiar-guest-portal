import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/format";
import type { Property } from "@/lib/types";

interface OwnerRow {
  id: string;
  full_name: string | null;
}

async function load(handle: string): Promise<{ owner: OwnerRow; properties: Property[] } | null> {
  const admin = createAdminClient();
  const { data: ownerData } = await admin
    .from("owners")
    .select("id, full_name")
    .eq("handle", handle)
    .maybeSingle();
  const owner = ownerData as OwnerRow | null;
  if (!owner) return null;
  const { data } = await admin
    .from("properties")
    .select("*")
    .eq("owner_id", owner.id)
    .eq("is_listed", true)
    .order("created_at", { ascending: true });
  return { owner, properties: (data ?? []) as Property[] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const res = await load(handle);
  const who = res?.owner.full_name ? `${res.owner.full_name}` : "our";
  return { title: `Book direct — ${who} stays` };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const res = await load(handle);
  if (!res) notFound();
  const { owner, properties } = res;
  const hostName = owner.full_name?.split(" ")[0];

  return (
    <div className="store-wrap">
      <header className="store-head">
        <div className="bk-brand" style={{ marginBottom: 6 }}>Familiar&nbsp;Guest</div>
        <h1>{hostName ? `${hostName}'s places` : "Book your stay"}</h1>
        <p>Book directly with your host — secure payment, no platform markup.</p>
      </header>

      {properties.length === 0 ? (
        <p className="store-empty">No listings are published yet. Check back soon.</p>
      ) : (
        <div className="store-grid">
          {properties.map((p) => (
            <a key={p.id} className="store-card" href={`/h/${handle}/${p.slug}`}>
              <div className="store-photo">
                {p.photos[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photos[0]} alt={p.name} />
                ) : (
                  <div className="store-photo-ph" />
                )}
              </div>
              <div className="store-body">
                {p.location && <p className="store-loc">{p.location}</p>}
                <h3>{p.name}</h3>
                {p.description && <p className="store-desc">{p.description}</p>}
                {p.nightly_rate_cents != null && (
                  <p className="store-price">
                    <strong>{formatMoney(p.nightly_rate_cents, p.currency)}</strong> / night
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      <footer className="store-foot">
        Powered by <strong>Familiar Guest</strong>
      </footer>
    </div>
  );
}
