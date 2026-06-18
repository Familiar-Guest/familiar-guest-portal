"use client";

/** Country dialing codes — target markets first, then alphabetical. */
const COUNTRIES = [
  { code: "US", dial: "+1",   label: "United States (+1)" },
  { code: "CA", dial: "+1",   label: "Canada (+1)" },
  { code: "MX", dial: "+52",  label: "Mexico (+52)" },
  { code: "AU", dial: "+61",  label: "Australia (+61)" },
  { code: "BR", dial: "+55",  label: "Brazil (+55)" },
  { code: "CN", dial: "+86",  label: "China (+86)" },
  { code: "CO", dial: "+57",  label: "Colombia (+57)" },
  { code: "DE", dial: "+49",  label: "Germany (+49)" },
  { code: "ES", dial: "+34",  label: "Spain (+34)" },
  { code: "FR", dial: "+33",  label: "France (+33)" },
  { code: "GB", dial: "+44",  label: "United Kingdom (+44)" },
  { code: "IN", dial: "+91",  label: "India (+91)" },
  { code: "IT", dial: "+39",  label: "Italy (+39)" },
  { code: "JP", dial: "+81",  label: "Japan (+81)" },
  { code: "KR", dial: "+82",  label: "South Korea (+82)" },
  { code: "NL", dial: "+31",  label: "Netherlands (+31)" },
  { code: "NZ", dial: "+64",  label: "New Zealand (+64)" },
  { code: "PT", dial: "+351", label: "Portugal (+351)" },
  { code: "TW", dial: "+886", label: "Taiwan (+886)" },
];

interface PhoneFieldProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  required?: boolean;
  autoComplete?: string;
}

/**
 * Phone input with a country-code selector. The stored value is the full
 * number including the dial code (e.g. "+1 555 123 4567"). The selector
 * defaults to US and shows the dial code so users don't type it manually.
 */
export function PhoneField({
  id,
  label = "Phone",
  value,
  onChange,
  optional,
  required,
  autoComplete = "tel",
}: PhoneFieldProps) {
  // Parse existing value to pre-select the right country on load.
  function detectDial(v: string): string {
    for (const c of COUNTRIES) {
      if (v.startsWith(c.dial)) return c.dial;
    }
    return "+1";
  }

  const storedDial = detectDial(value);
  const storedLocal = value.startsWith(storedDial)
    ? value.slice(storedDial.length).trimStart()
    : value;

  function handleDialChange(newDial: string) {
    onChange(storedLocal ? `${newDial} ${storedLocal}` : "");
  }

  function handleLocalChange(local: string) {
    onChange(local ? `${storedDial} ${local}` : "");
  }

  return (
    <div className="bk-field">
      <label htmlFor={id}>
        {label}{" "}
        {optional && <span style={{ fontWeight: 400 }}>(optional)</span>}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <select
          value={storedDial}
          onChange={(e) => handleDialChange(e.target.value)}
          aria-label="Country code"
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 10px",
            fontSize: 15,
            fontFamily: "var(--body)",
            color: "var(--ink)",
            background: "#fff",
            flexShrink: 0,
            minWidth: 80,
          }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.dial}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          id={id}
          type="tel"
          value={storedLocal}
          onChange={(e) => handleLocalChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
}
