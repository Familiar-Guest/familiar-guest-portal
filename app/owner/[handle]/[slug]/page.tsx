import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/format";
import { cleaningFeeForStay } from "@/lib/availability";
import { computeBusyRanges } from "@/lib/availability";
import type { Property } from "@/lib/types";
import { ListingBooking } from "@/app/h/[handle]/[slug]/ListingBooking";

async function load(handle: string, slug: string): Promise<Property | null> {
  const admin = createAdminClient();
  const { data: owner } = await admin
    .from("owners")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();
  const ownerId = (owner as { id: string } | null)?.id;
  if (!ownerId) return null;
  const { data } = await admin
    .from("properties")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("slug", slug)
    .eq("is_listed", true)
    .maybeSingle();
  return (data as Property) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}): Promise<Metadata> {
  const { handle, slug } = await params;
  const p = await load(handle, slug);
  return { title: p ? `${p.name} — Familiar Guest` : "Listing" };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>;
}) {
  const { handle, slug } = await params;
  const property = await load(handle, slug);
  if (!property) notFound();

  const admin = createAdminClient();
  const ranges = await computeBusyRanges(admin, property.id, property.airbnb_ical_url);
  const busy = ranges.map((r) => ({ start: r.start, end: r.end }));

  return (
    <div className="listing-wrap">
      <a className="listing-back" href={`/owner/${handle}`}>← All listings</a>

      {property.photos.length > 0 && (
        <div className="listing-gallery">
          {property.photos.slice(0, 10).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt={`${property.name} ${i + 1}`} className={i === 0 ? "lg-main" : "lg-thumb"} />
          ))}
        </div>
      )}

      <div className="listing-grid">
        <div>
          {property.location && <p className="listing-loc">{property.location}</p>}
          <h1 className="listing-name">{property.name}</h1>
          {property.description && <p className="listing-desc">{property.description}</p>}
          <div className="listing-facts">
            {property.nightly_rate_cents != null && (
              <span><strong>{formatMoney(property.nightly_rate_cents, property.currency)}</strong> / night</span>
            )}
            {property.cleaning_fee_type === "daily" ? (
              property.daily_cleaning_fee_cents > 0 && (
                <span>{formatMoney(property.daily_cleaning_fee_cents, property.currency)}/night cleaning</span>
              )
            ) : (
              cleaningFeeForStay(property, property.min_nights) > 0 && (
                <span>{formatMoney(cleaningFeeForStay(property, property.min_nights), property.currency)} cleaning</span>
              )
            )}
            <span>{property.min_nights}-night minimum</span>
          </div>
        </div>

        <ListingBooking
          propertyId={property.id}
          currency={property.currency}
          nightlyRateCents={property.nightly_rate_cents ?? 0}
          cleaningFeeType={property.cleaning_fee_type}
          cleaningFeeCents={property.cleaning_fee_cents}
          dailyCleaningFeeCents={property.daily_cleaning_fee_cents}
          altCleaningFee1Cents={property.alt_cleaning_fee_1_cents}
          altCleaningFee2Cents={property.alt_cleaning_fee_2_cents}
          minNights={property.min_nights}
          busy={busy}
          loginNext={`/owner/${handle}/${slug}`}
        />
      </div>
    </div>
  );
}
