"use client";

import { useState } from "react";

interface PasswordFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
}

/** Password input with a show/hide eye toggle. Used on all auth pages. */
export function PasswordField({
  id,
  value,
  onChange,
  label = "Password",
  autoComplete = "current-password",
  minLength,
  required,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="bk-field">
      <label htmlFor={id}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
          style={{ width: "100%", paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          title={show ? "Hide password" : "Show password"}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--ink-soft, #4F605A)",
            padding: 0,
          }}
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  );
}

function Eye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.8 3.7M6.6 6.6A18.5 18.5 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 3.5-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
