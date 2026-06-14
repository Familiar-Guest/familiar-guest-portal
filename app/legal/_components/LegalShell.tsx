import Link from "next/link";

export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="wrap legal-page">
      <div className="legal-head">
        <Link href="/" className="back">
          ← Back to Familiar Guest
        </Link>
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {updated}</p>
      </div>

      <div className="legal-draft">
        <strong>Draft for legal review.</strong> This document is a working
        draft prepared to give counsel a starting point reflecting common
        practice for vacation-rental booking platforms. It is not yet
        finalized, has not been reviewed by an attorney, and should not be
        relied upon as the operative policy until reviewed and approved by
        Familiar Guest&rsquo;s legal counsel (including Mexican counsel for
        cross-border provisions).
      </div>

      <div className="legal-body">{children}</div>
    </div>
  );
}
