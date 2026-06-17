"use client";

import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  id?: string;
}

const TOOLBAR_BTNS = [
  { cmd: "bold",        icon: "<strong>B</strong>",  title: "Bold" },
  { cmd: "italic",      icon: "<em>I</em>",           title: "Italic" },
  { cmd: "insertUnorderedList", icon: "• List",       title: "Bullet list" },
  { cmd: "insertOrderedList",   icon: "1. List",      title: "Numbered list" },
  { cmd: "outdent",     icon: "⇤",                    title: "Decrease indent" },
  { cmd: "indent",      icon: "⇥",                    title: "Increase indent" },
];

export function RichTextEditor({ value, onChange, placeholder, minHeight = 120, id }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external value into the editor only when it differs (prevents cursor jump).
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (isInternalUpdate.current) { isInternalUpdate.current = false; return; }
    if (el.innerHTML !== value) el.innerHTML = value ?? "";
  }, [value]);

  function handleInput() {
    const el = editorRef.current;
    if (!el) return;
    isInternalUpdate.current = true;
    onChange(el.innerHTML);
  }

  function exec(cmd: string) {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
    handleInput();
  }

  const showPlaceholder = !value || value === "<br>" || value === "";

  return (
    <div style={{ border: "1px solid #E0D6C5", borderRadius: 6, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{
        display: "flex",
        gap: 2,
        padding: "6px 8px",
        background: "#F6F1E8",
        borderBottom: "1px solid #E0D6C5",
      }}>
        {TOOLBAR_BTNS.map(({ cmd, icon, title }) => (
          <button
            key={cmd}
            type="button"
            title={title}
            onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
            style={{
              background: "none",
              border: "none",
              borderRadius: 4,
              padding: "3px 8px",
              cursor: "pointer",
              fontSize: 13,
              color: "#16302B",
              lineHeight: 1.4,
            }}
            dangerouslySetInnerHTML={{ __html: icon }}
          />
        ))}
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
