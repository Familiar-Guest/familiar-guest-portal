interface BrandMarkProps {
  href?: string;
  style?: React.CSSProperties;
}

/** Shared Familiar Guest logo + wordmark, used on every portal/auth/booking page. */
export function BrandMark({ href = "/", style }: BrandMarkProps) {
  return (
    <a href={href} className="bk-brand" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/key-logo.png" alt="" aria-hidden="true" />
      Familiar&nbsp;Guest
    </a>
  );
}
