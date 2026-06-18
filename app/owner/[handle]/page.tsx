import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/format";
import type { Property } from "@/lib/types";

interface OwnerRow {
  id: string;
  full_name: string | null;
  public_name: string | null;
}

async function load(handle: string): Promise<{ owner: OwnerRow; properties: Property[] } | null> {
  const admin = createAdminClient();
  const { data: ownerData } = await admin
    .from("owners")
    .select("id, full_name, public_name")
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
  const displayName = res?.owner.public_name || res?.owner.full_name || "our";
  return { title: `${displayName} — Book direct` };
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
  const displayName = owner.public_name || owner.full_name || "Book your stay";

  return (
    <div className="sf-page">
      <header className="sf-head">
        <div className="sf-head-inner">
          <div className="sf-brand">Familiar&nbsp;Guest</div>
          <div className="sf-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Verified owner &middot; Secure payment
          </div>
          <h1 className="sf-title">{displayName}</h1>
          <p className="sf-sub">Book directly — no platform fees, payment held in escrow until check-in.</p>
        </div>
      </header>

      <main className="sf-main">
        {properties.length === 0 ? (
          <div className="sf-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            <p>No listings published yet. Check back soon.</p>
          </div>
        ) : (
          <>
            <p className="sf-count">
              {properties.length === 1 ? "1 property" : `${properties.length} properties`}
            </p>
            <div className="sf-grid">
              {properties.map((p) => (
                <a key={p.id} className="sf-card" href={`/owner/${handle}/${p.slug}`}>
                  <div className="sf-photo">
                    {p.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photos[0]} alt={p.name} />
                    ) : (
                      <div className="sf-photo-ph" />
                    )}
                    <span className="sf-direct-pill">Book direct</span>
                  </div>
                  <div className="sf-body">
                    {p.location && <p className="sf-loc">{p.location}</p>}
                    <h3 className="sf-name">{p.name}</h3>
                    {p.description && <p className="sf-desc">{p.description}</p>}
                    <div className="sf-card-foot">
                      {p.nightly_rate_cents != null ? (
                        <p className="sf-price">
                          <strong>{formatMoney(p.nightly_rate_cents, p.currency)}</strong>
                          <span className="sf-per"> / night</span>
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="sf-cta">View &amp; book →</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="sf-foot">
        <div className="sf-foot-inner">
          <span>Powered by <strong>Familiar Guest</strong></span>
          <span className="sf-foot-trust">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Payment held in escrow until check-in
          </span>
        </div>
      </footer>
    </div>
  );
}
