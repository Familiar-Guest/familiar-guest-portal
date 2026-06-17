"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  id?: string;
}

type Cmd = "bold" | "italic" | "insertUnorderedList" | "insertOrderedList" | "outdent" | "indent";

interface ToolbarItem {
  cmd: Cmd;
  title: string;
  icon: React.ReactNode;
  /** Whether this command exposes an on/off state worth highlighting. */
  stateful?: boolean;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TOOLBAR: (ToolbarItem | "divider")[] = [
  {
    cmd: "bold",
    title: "Bold (Ctrl+B)",
    stateful: true,
    icon: <span style={{ fontWeight: 800, fontSize: 15, fontFamily: "Georgia, serif" }}>B</span>,
  },
  {
    cmd: "italic",
    title: "Italic (Ctrl+I)",
    stateful: true,
    icon: <span style={{ fontStyle: "italic", fontSize: 15, fontFamily: "Georgia, serif" }}>I</span>,
  },
  "divider",
  {
    cmd: "insertUnorderedList",
    title: "Bulleted list",
    stateful: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" {...stroke}>
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4.5" cy="6" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="4.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="4.5" cy="18" r="1.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    cmd: "insertOrderedList",
    title: "Numbered list",
    stateful: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" {...stroke}>
        <line x1="10" y1="6" x2="20" y2="6" />
        <line x1="10" y1="12" x2="20" y2="12" />
        <line x1="10" y1="18" x2="20" y2="18" />
        <text x="2.5" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="Inter, sans-serif">1</text>
        <text x="2.5" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="Inter, sans-serif">2</text>
        <text x="2.5" y="20" fontSize="7" fill="currentColor" stroke="none" fontFamily="Inter, sans-serif">3</text>
      </svg>
    ),
  },
  "divider",
  {
    cmd: "outdent",
    title: "Decrease indent",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" {...stroke}>
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="11" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <polyline points="7,9 4,12 7,15" />
      </svg>
    ),
  },
  {
    cmd: "indent",
    title: "Increase indent",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" {...stroke}>
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="11" y1="12" x2="20" y2="12" />
        <line x1="4" y1="18" x2="20" y2="18" />
        <polyline points="4,9 7,12 4,15" />
      </svg>
    ),
  },
];

export function RichTextEditor({ value, onChange, placeholder, minHeight = 120, id }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [hovered, setHovered] = useState<string | null>(null);

  // Sync external value into the editor only when it differs (prevents cursor jump).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalUpdate.current) { isInternalUpdate.current = false; return; }
    if (el.innerHTML !== value) el.innerHTML = value ?? "";
  }, [value]);

  // Reflect the current selection's formatting in the toolbar (B/I/list highlight).
  const refreshActive = useCallback(() => {
    if (typeof document === "undefined") return;
    const next: Record<string, boolean> = {};
    for (const item of TOOLBAR) {
      if (item === "divider" || !item.stateful) continue;
      try {
        next[item.cmd] = document.queryCommandState(item.cmd);
      } catch {
        next[item.cmd] = false;
      }
    }
    setActive(next);
  }, []);

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    isInternalUpdate.current = true;
    onChange(el.innerHTML);
    refreshActive();
  }

  function exec(cmd: Cmd) {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
    handleInput();
  }

  const showPlaceholder = !value || value === "<br>" || value === "";

  return (
    <div style={{ border: "1px solid #E0D6C5", borderRadius: 6, overflow: "hidden", background: "#fff" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "5px 6px",
          background: "#F6F1E8",
          borderBottom: "1px solid #E0D6C5",
        }}
      >
        {TOOLBAR.map((item, i) => {
          if (item === "divider") {
            return (
              <span
                key={`d${i}`}
                aria-hidden="true"
                style={{ width: 1, alignSelf: "stretch", margin: "4px 4px", background: "#E0D6C5" }}
              />
            );
          }
          const isActive = Boolean(active[item.cmd]);
          const isHover = hovered === item.cmd;
          return (
            <button
              key={item.cmd}
              type="button"
              title={item.title}
              aria-label={item.title}
              aria-pressed={item.stateful ? isActive : undefined}
              onMouseDown={(e) => { e.preventDefault(); exec(item.cmd); }}
              onMouseEnter={() => setHovered(item.cmd)}
              onMouseLeave={() => setHovered((h) => (h === item.cmd ? null : h))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                padding: 0,
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                color: isActive ? "#0F4D45" : "#16302B",
                background: isActive ? "#D6E7E1" : isHover ? "#EAE0CF" : "transparent",
                transition: "background 0.12s ease",
              }}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Editable area */}
      <div style={{ position: "relative" }}>
        {showPlaceholder && (
          <div style={{
            position: "absolute",
            top: 10,
            left: 12,
            color: "#9eada6",
            pointerEvents: "none",
            fontSize: 14,
          }}>
            {placeholder}
          </div>
        )}
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyUp={refreshActive}
          onMouseUp={refreshActive}
          onFocus={refreshActive}
          style={{
            minHeight,
            padding: "10px 12px",
            fontSize: 14,
            lineHeight: 1.6,
            outline: "none",
            color: "#16302B",
          }}
        />
      </div>
    </div>
  );
}
