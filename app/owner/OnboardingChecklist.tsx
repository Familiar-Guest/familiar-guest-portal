"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "fg_onboarding_dismissed";

interface Item {
  id: string;
  label: string;
  description: string;
  tab: "settings" | "properties" | "policies";
  done: boolean;
}

interface Props {
  publicName: string | null;
  propertyCount: number;
  policiesConfigured: boolean;
  onNavigate: (tab: "settings" | "properties" | "policies") => void;
}

export function OnboardingChecklist({ publicName, propertyCount, policiesConfigured, onNavigate }: Props) {
  const [dismissed, setDismissed] = useState(true); // start hidden; load from storage
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* */ }
    setDismissed(true);
  }

  const items: Item[] = [
    {
      id: "name",
      label: "Confirm your public name",
      description:
        "Your public name appears on your listing page and becomes part of your booking link (e.g. famguest.com/owner/casa-sol). You can use a property or company name instead of your personal name.",
      tab: "settings",
      done: Boolean(publicName),
    },
    {
      id: "property",
      label: "Add a property",
      description:
        "Set up your first place — add photos, a nightly rate, and link your Airbnb calendar to block already-booked dates. Once published, guests can browse and request to book.",
      tab: "properties",
      done: propertyCount > 0,
    },
    {
      id: "policies",
      label: "Set your rental policies",
      description:
        "Configure your deposit requirements, cancellation windows, and refund rules. These apply to all your properties and are shown to guests before they pay.",
      tab: "policies",
      done: policiesConfigured,
    },
  ];

  const allDone = items.every((i) => i.done);
  if (dismissed || allDone) return null;

  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="ob-wrap">
      <div className="ob-head">
        <div className="ob-title-row">
          <span className="ob-title">Get set up</span>
          <span className="ob-progress">{doneCount} of {items.length} complete</span>
        </div>
        <button className="op-link" onClick={dismiss} aria-label="Dismiss checklist" style={{ fontSize: 18, lineHeight: 1, padding: "0 2px" }}>
          ×
        </button>
      </div>
      <div className="ob-track">
        <div className="ob-track-fill" style={{ width: `${(doneCount / items.length) * 100}%` }} />
      </div>
      <ul className="ob-list">
        {items.map((item) => (
          <li key={item.id} className={`ob-item${item.done ? " ob-done" : ""}`}>
            <button
              className="ob-item-btn"
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              aria-expanded={expanded === item.id}
            >
              <span className="ob-check" aria-hidden="true">
                {item.done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <span className="ob-num" />
                )}
              </span>
              <span className="ob-item-label">{item.label}</span>
              <span className="ob-chevron" aria-hidden="true">{expanded === item.id ? "▲" : "▼"}</span>
            </button>
            {expanded === item.id && (
              <div className="ob-detail">
                <p className="ob-desc">{item.description}</p>
                {!item.done && (
                  <button
                    className="bk-btn"
                    style={{ padding: "9px 18px", fontSize: 14, marginTop: 8 }}
                    onClick={() => { onNavigate(item.tab); setExpanded(null); }}
                  >
                    {item.tab === "settings" ? "Go to Settings →" : item.tab === "properties" ? "Go to Properties →" : "Go to Global Policies →"}
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
