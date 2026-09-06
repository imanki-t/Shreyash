"use client";

import React, { useState } from "react";

export interface RedactedTextProps {
  content?: string;
  text?: string;
  children?: React.ReactNode;
  defaultRevealed?: boolean;
  className?: string;
}

export default function RedactedText({
  content,
  text,
  children,
  defaultRevealed = false,
  className = "",
}: RedactedTextProps) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const rawText = content || text;

  if (rawText) {
    const parts = rawText.split(
      /(<\/[^>]*?\\>|\|\|[\s\S]*?\|\||<span[^>]*class="[^"]*classified-spoiler[^"]*"[^>]*>[\s\S]*?<\/span>)/g
    );
    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (!part) return null;

          if (part.startsWith("</") && part.endsWith("\\>")) {
            const secret = part.slice(2, -2).trim();
            return <InlineRedacted key={index}>{secret}</InlineRedacted>;
          }

          if (part.startsWith("||") && part.endsWith("||")) {
            const secret = part.slice(2, -2).trim();
            return <InlineRedacted key={index}>{secret}</InlineRedacted>;
          }

          const spanMatch = part.match(
            /<span[^>]*class="[^"]*classified-spoiler[^"]*"[^>]*>([\s\S]*?)<\/span>/i
          );
          if (spanMatch) {
            return <InlineRedacted key={index}>{spanMatch[1]}</InlineRedacted>;
          }

          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  }

  return (
    <span
      onClick={() => setRevealed(!revealed)}
      title="Click to declassify / toggle redaction"
      className={`redacted-tape ${revealed ? "revealed" : ""} ${className}`}
    >
      {children}
    </span>
  );
}

function InlineRedacted({ children }: { children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        setRevealed(!revealed);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          setRevealed(!revealed);
        }
      }}
      role="button"
      tabIndex={0}
      title={revealed ? "Click to Re-Censor" : "CLASSIFIED REDACTION // Click to Decrypt"}
      className={`redacted-tape classified-spoiler ${revealed ? "revealed" : ""}`}
    >
      {children}
    </span>
  );
}
