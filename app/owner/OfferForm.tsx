"use client";

import { useEffect, useState } from "react";
import type { Property } from "@/lib/types";
import { formatMoney, nights } from "@/lib/format";
import { quoteStay } from "@/lib/pricing";
import { DateRangePicker } from "@/app/components/DateRangePicker";

/** A property can be auto-priced from the calendar if it has a standard rate or any non-standard ranges. */
function supportsCalendarPricing(p?: Property | null): boolean {
  return Boolean(p && ((p.nightly_rate_cents ?? 0) > 0 || (p.nonstandard_rates?.length ?? 0) > 0));
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Cents → a plain editable amount string. Empty when unset/zero. */
function centsToStr(cents: number | null | undefined): string {
  return cents != null && cents > 0 ? String(cents / 100) : "";
}

export type FormMode = "create" | "edit" | "rebook";

export interface OfferInitial {
  id?: string;
  property_id?: string;
  property_name?: string; // for edit display (property is fixed)
  guest_name?: string;
  guest_email?: string;
  check_in?: string;
  check_out?: string;
  nightly_rate?: string;
  cleaning_fee?: string;
  currency?: string;
  paid?: boolean; // editing an already-paid booking
  // Per-booking policy overrides
  policy_checkin_email_days?: string;
  policy_deposit_required_days?: string;
  policy_full_payment_due_days?: string;
  policy_refund_100_days?: string;
  policy_refund_50_days?: string;
  policy_deposit_pct?: string;
}

interface Conflict {
  type: "booking" | "calendar";
  start: string;
  end: string;
  summary?: string;
  guest_name?: string;
  status?: string;
}

interface Result {
  booking_url: string;
  email_sent: boolean;
}

interface BusyRange { start: string; end: string }

const TITLES: Record<FormMode, string> = {
  create: "Send a stay offer",
  edit: "Edit offer",
  rebook: "Send a rebook offer",
};

export function OfferForm({
  mode,
  properties,
  initial,
  onDone,
  onCancel,
}: {
  mode: FormMode;
  properties: Property[];
  initial?: OfferInitial;
  onDone: () => void;
  onCancel: () => void;
}) {
  const initialPropertyId = initial?.property_id ?? properties[0]?.id ?? "";
  const initialProperty = properties.find((p) => p.id === initialPropertyId);
  const [form, setForm] = useState({
    property_id: initialPropertyId,
    guest_name: initial?.guest_name ?? "",
    guest_email: initial?.guest_email ?? "",
    check_in: initial?.check_in ?? "",
    check_out: initial?.check_out ?? "",
    nightly_rate:
      initial?.nightly_rate ?? centsToStr(initialProperty?.nightly_rate_cents),
    cleaning_fee:
      initial?.cleaning_fee ?? centsToStr(initialProperty?.cleaning_fee_cents),
    currency: initial?.currency ?? initialProperty?.currency ?? "usd",
    // Per-booking policy overrides (seeded from global policies on mount)
    policy_checkin_email_days:    initial?.policy_checkin_email_days    ?? "",
    policy_deposit_required_days: initial?.policy_deposit_required_days ?? "",
    policy_full_payment_due_days: initial?.policy_full_payment_due_days ?? "",
    policy_refund_100_days:       initial?.policy_refund_100_days       ?? "",
    policy_refund_50_days:        initial?.policy_refund_50_days        ?? "",
    policy_deposit_pct:           initial?.policy_deposit_pct           ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [busyRanges, setBusyRanges] = useState<BusyRange[]>([]);
  // Once the owner edits a pricing field (rate, cleaning fee, or currency), stop
  // overwriting it when the selected property changes (the property's defaults
  // seed the field, then back off).
  const [pricingTouched, setPricingTouched] = useState(
    Boolean(initial?.nightly_rate || initial?.cleaning_fee || initial?.currency)
  );
  // Pricing mode: "calendar" auto-prices from the property's per-day rates;
  // "custom" uses a flat nightly rate the owner types (and $0 comp stays).
  // Default: editing a booking that has a stored flat rate keeps custom (so the
  // price is preserved); a mixed-rate (no stored flat rate) booking, and any
  // new/rebook offer, default to calendar when the property supports it.
  const [pricingMode, setPricingMode] = useState<"calendar" | "custom">(
    mode === "edit" && initial?.nightly_rate
      ? "custom"
      : supportsCalendarPricing(initialProperty)
      ? "calendar"
      : "custom"
  );

  // Fetch busy ranges for the selected property so the calendar can gray them out.
  useEffect(() => {
    if (!form.property_id) return;
    const exclude = initial?.id ? `?exclude=${initial.id}` : "";
    fetch(`/api/owner/property/${form.property_id}/availability${exclude}`)
      .then((r) => r.json())
      .then((d) => { if (d.busy) setBusyRanges(d.busy); })
      .catch(() => {});
  }, [form.property_id, initial?.id]);

  // Seed policy fields from global policies (only for fields not already set from an existing booking).
  useEffect(() => {
    fetch("/api/owner/policies")
      .then((r) => r.json())
      .then((d) => {
        if (!d.policy) return;
        const p = d.policy;
        setForm((f) => ({
          ...f,
          policy_checkin_email_days:    f.policy_checkin_email_days    || String(p.checkin_email_days),
          policy_deposit_required_days: f.policy_deposit_required_days || String(p.deposit_required_days),
          policy_full_payment_due_days: f.policy_full_payment_due_days || String(p.full_payment_due_days),
          policy_refund_100_days:       f.policy_refund_100_days       || String(p.refund_100_days),
          policy_refund_50_days:        f.policy_refund_50_days        || String(p.refund_50_days),
          policy_deposit_pct:           f.policy_deposit_pct           || String(p.deposit_pct),
        }));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const selectedProperty = properties.find((p) => p.id === form.property_id);
  const currency = form.currency.toUpperCase();
  const isPaidEdit = mode === "edit" && Boolean(initial?.paid);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setProperty(id: string) {
    const p = properties.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      property_id: id,
      nightly_rate: pricingTouched
        ? f.nightly_rate
        : centsToStr(p?.nightly_rate_cents),
      cleaning_fee: pricingTouched
        ? f.cleaning_fee
        : centsToStr(p?.cleaning_fee_cents),
      currency: pricingTouched ? f.currency : p?.currency ?? f.currency,
    }));
    // Keep the pricing mode valid for the newly selected property: a property
    // without any rates set can't use calendar pricing.
    if (!supportsCalendarPricing(p)) setPricingMode("custom");
    else if (mode !== "edit") setPricingMode("calendar");
  }

  function setPricing(key: "nightly_rate" | "cleaning_fee" | "currency", value: string) {
    setPricingTouched(true);
    set(key, value);
  }

  const canUseCalendar = supportsCalendarPricing(selectedProperty);

  // Live total preview. In calendar mode the subtotal comes from the property's
  // per-day rates; in custom mode it's the flat nightly rate × nights.
  const stayNights =
    DATE_RE.test(form.check_in) &&
    DATE_RE.test(form.check_out) &&
    form.check_out > form.check_in
      ? nights(form.check_in, form.check_out)
      : 0;
  const nightlyCents = Math.round((Number(form.nightly_rate) || 0) * 100);
  const cleaningCents = Math.round((Number(form.cleaning_fee) || 0) * 100);
  const quote =
    pricingMode === "calendar" && stayNights > 0 && selectedProperty
      ? quoteStay(
          selectedProperty.nightly_rate_cents ?? 0,
          selectedProperty.nonstandard_rates ?? [],
          form.check_in,
          form.check_out
        )
      : null;
  const subtotalCents =
    pricingMode === "calendar" ? quote?.subtotalCents ?? 0 : nightlyCents * stayNights;
  const totalCents = stayNights > 0 ? subtotalCents + cleaningCents : 0;
  const isFreeStay = stayNights > 0 && totalCents === 0;

  async function submit(force: boolean) {
    setLoading(true);
    setError(null);
    if (!force) setConflict(null);

    const isEdit = mode === "edit" && initial?.id;
    const url = isEdit ? `/api/owner/offer/${initial!.id}` : "/api/owner/offer";
    const method = isEdit ? "PATCH" : "POST";
    const payload = {
      ...form,
      nightly_rate: Number(form.nightly_rate) || 0,
      cleaning_fee: Number(form.cleaning_fee) || 0,
      pricing_mode: pricingMode,
      kind: mode === "rebook" ? "rebook" : "offer",
      force,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (res.status === 409 && data.conflict) {
      setConflict(data.conflict as Conflict);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    setResult({ booking_url: data.booking_url, email_sent: data.email_sent });
    setLoading(false);
  }

  if (result) {
    const isFreeOffer = result.booking_url && !result.booking_url.includes("pay");
    return (
      <div className="bk-card">
        <span className="bk-badge">
          ✓ {isPaidEdit ? "Booking updated" : mode === "edit" ? "Offer updated" : "Offer sent"}
        </span>
        <h1>
          {isPaidEdit ? "Updated booking for " : mode === "edit" ? "Updated offer for " : "Offer sent to "}
          {form.guest_name}
        </h1>
        <p className="bk-lead">
          {isPaidEdit
            ? result.email_sent
              ? `We emailed ${form.guest_email} the updated booking details.`
              : `The booking was updated, but the change email could not be sent — let your guest know directly.`
            : result.email_sent
            ? `An invitation email was sent to ${form.guest_email}.`
            : `The offer was saved, but the email could not be sent. Share the link below directly.`}
        </p>
        {!isPaidEdit && (
          <div className="bk-field">
            <label>Offer link</label>
            <div className="bk-ok">{result.booking_url}</div>
          </div>
        )}
        <button className="bk-btn" onClick={onDone}>
          Back to portal
        </button>
      </div>
    );
  }

  const conflictMsg = conflict
    ? conflict.type === "calendar"
      ? `Your Airbnb calendar shows these dates as busy (${conflict.start} → ${conflict.end}${
          conflict.summary ? `: ${conflict.summary}` : ""
        }).`
      : `These dates overlap an existing ${
          conflict.status === "paid" ? "booking" : "offer"
        }${conflict.guest_name ? ` for ${conflict.guest_name}` : ""} (${conflict.start} → ${conflict.end}).`
    : "";

  const noProperties = properties.length === 0;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="bk-card">
      <h1>{isPaidEdit ? "Edit booking" : TITLES[mode]}</h1>
      <p className="bk-lead">
        {isPaidEdit
          ? "Update this confirmed booking. Saving emails the guest the new details, including the old and new dates. No new payment is collected."
          : mode === "rebook"
          ? "Pick the new dates and price — guest details are pre-filled. They'll get an email with a link to pay."
          : mode === "edit"
          ? "Update the details. Saving re-sends the offer email; the dates stay held for the guest until check-in."
          : "Set the dates and price for your guest. They'll get an email with a link to confirm — no account needed."}
        {mode === "create" &&
          " As soon as you send this, we'll block these dates on this property so no one else can book them."}
      </p>

      {noProperties && (
        <div className="bk-error">
          Add a property first, then you can send offers for it.
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <div className="bk-field">
          <label htmlFor="property">Property</label>
          {mode === "edit" ? (
            <input value={initial?.property_name ?? selectedProperty?.name ?? ""} disabled />
          ) : (
            <select
              id="property"
              value={form.property_id}
              onChange={(e) => setProperty(e.target.value)}
              required
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="guest_name">Guest name</label>
            <input
              id="guest_name"
              value={form.guest_name}
              onChange={(e) => set("guest_name", e.target.value)}
              required
            />
          </div>
          <div className="bk-field">
            <label htmlFor="guest_email">Guest email</label>
            <input
              id="guest_email"
              type="email"
              value={form.guest_email}
              onChange={(e) => set("guest_email", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="bk-field">
          <label>Dates</label>
          <DateRangePicker
            checkIn={form.check_in}
            checkOut={form.check_out}
            onCheckIn={(d) => set("check_in", d)}
            onCheckOut={(d) => set("check_out", d)}
            busy={busyRanges}
            minDate={today}
          />
          {/* Hidden required inputs so the form validates dates are set */}
          <input type="hidden" value={form.check_in} required />
          <input type="hidden" value={form.check_out} required />
        </div>

        <div className="bk-field">
          <label htmlFor="offer_currency">Currency</label>
          <select
            id="offer_currency"
            value={form.currency}
            onChange={(e) => setPricing("currency", e.target.value)}
            disabled={isPaidEdit}
          >
            <option value="usd">USD — US Dollar</option>
            <option value="cad">CAD — Canadian Dollar</option>
            <option value="mxn">MXN — Mexican Peso</option>
            <option value="eur">EUR — Euro</option>
          </select>
          <p className="bk-note" style={{ textAlign: "left", marginTop: 5 }}>
            Defaults to the property&rsquo;s currency — change it for this offer if needed. The guest pays in this currency.
          </p>
        </div>

        <div className="bk-grid2">
          <div className="bk-field">
            {pricingMode === "calendar" ? (
              <>
                <label>Nightly pricing</label>
                <div className="ns-add" style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, color: "var(--ink)" }}>
                    Auto-priced from this property&rsquo;s daily rates for the selected dates.
                  </div>
                  <button
                    type="button"
                    className="op-link"
                    style={{ marginTop: 6 }}
                    onClick={() => setPricingMode("custom")}
                  >
                    Set a custom price instead
                  </button>
                </div>
              </>
            ) : (
              <>
                <label htmlFor="nightly_rate">Nightly rate ({currency})</label>
                <input
                  id="nightly_rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.nightly_rate}
                  onChange={(e) => setPricing("nightly_rate", e.target.value)}
                  placeholder="0"
                />
                {canUseCalendar && (
                  <button
                    type="button"
                    className="op-link"
                    style={{ marginTop: 6 }}
                    onClick={() => setPricingMode("calendar")}
                  >
                    Use calendar pricing
                  </button>
                )}
              </>
            )}
          </div>
          <div className="bk-field">
            <label htmlFor="cleaning_fee">
              Cleaning fee ({currency}){" "}
              <span style={{ fontWeight: 400 }}>(from property default)</span>
            </label>
            <input
              id="cleaning_fee"
              type="number"
              min="0"
              step="0.01"
              value={form.cleaning_fee}
              onChange={(e) => setPricing("cleaning_fee", e.target.value)}
            />
          </div>
        </div>

        {stayNights > 0 && (
          <div className="bk-summary" style={{ margin: "0 0 18px" }}>
            {isFreeStay ? (
              <div className="bk-row">
                <span className="bk-label">Complimentary stay</span>
                <span className="bk-val" style={{ color: "var(--teal)" }}>No charge</span>
              </div>
            ) : (
              <>
                {pricingMode === "calendar" && quote
                  ? quote.segments.map((s, i) => (
                      <div className="bk-row" key={i}>
                        <span className="bk-label">
                          {formatMoney(s.rate_cents, currency)} × {s.nights}{" "}
                          {s.nights === 1 ? "night" : "nights"}
                          {s.name !== "Standard Daily Rate" ? ` · ${s.name}` : ""}
                        </span>
                        <span className="bk-val">
                          {formatMoney(s.rate_cents * s.nights, currency)}
                        </span>
                      </div>
                    ))
                  : nightlyCents > 0 && (
                      <div className="bk-row">
                        <span className="bk-label">
                          {formatMoney(nightlyCents, currency)} × {stayNights}{" "}
                          {stayNights === 1 ? "night" : "nights"}
                        </span>
                        <span className="bk-val">
                          {formatMoney(nightlyCents * stayNights, currency)}
                        </span>
                      </div>
                    )}
                {cleaningCents > 0 && (
                  <div className="bk-row">
                    <span className="bk-label">Cleaning fee</span>
                    <span className="bk-val">
                      {formatMoney(cleaningCents, currency)}
                    </span>
                  </div>
                )}
                <div className="bk-row bk-total">
                  <span className="bk-label">Guest pays</span>
                  <span className="bk-val">{formatMoney(totalCents, currency)}</span>
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18, marginTop: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
            Booking terms
          </p>
          <p className="bk-note" style={{ textAlign: "left", marginBottom: 12 }}>
            Defaults from your Global Policies — adjust for this offer if needed.{" "}
            <strong>All values are days before check-in.</strong>
          </p>
          <div className="bk-grid2">
            <div className="bk-field">
              <label htmlFor="p_checkin_email">Send check-in email</label>
              <input id="p_checkin_email" type="number" min="0" step="1"
                value={form.policy_checkin_email_days}
                onChange={(e) => set("policy_checkin_email_days", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="p_deposit_req">Deposit required</label>
              <input id="p_deposit_req" type="number" min="0" step="1"
                value={form.policy_deposit_required_days}
                onChange={(e) => set("policy_deposit_required_days", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="p_full_pay">Full payment due</label>
              <input id="p_full_pay" type="number" min="0" step="1"
                value={form.policy_full_payment_due_days}
                onChange={(e) => set("policy_full_payment_due_days", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="p_deposit_pct">Deposit %</label>
              <input id="p_deposit_pct" type="number" min="0" max="100" step="1"
                value={form.policy_deposit_pct}
                onChange={(e) => set("policy_deposit_pct", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="p_ref100">100% refund window</label>
              <input id="p_ref100" type="number" min="0" step="1"
                value={form.policy_refund_100_days}
                onChange={(e) => set("policy_refund_100_days", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="p_ref50">50% refund window</label>
              <input id="p_ref50" type="number" min="0" step="1"
                value={form.policy_refund_50_days}
                onChange={(e) => set("policy_refund_50_days", e.target.value)} />
            </div>
          </div>
        </div>

        {conflict && (
          <div className="bk-error">
            Heads up — {conflictMsg} You can send the offer anyway.
            <button
              type="button"
              className="bk-btn"
              style={{ marginTop: 10 }}
              disabled={loading}
              onClick={() => submit(true)}
            >
              Send anyway
            </button>
          </div>
        )}

        {!conflict && (
          <button
            className="bk-btn"
            type="submit"
            disabled={loading || noProperties || !form.check_in || !form.check_out}
          >
            {loading
              ? "Saving…"
              : isPaidEdit
              ? "Save & notify guest"
              : mode === "edit"
              ? "Save & re-send email"
              : "Create offer & send email"}
          </button>
        )}
        <button
          type="button"
          className="op-link"
          style={{ marginTop: 14 }}
          onClick={onCancel}
          disabled={loading}
        >
          ← Back to portal
        </button>
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
