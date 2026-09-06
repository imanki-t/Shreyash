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
    // Parse strings containing ||secret text|| syntax
    const parts = rawText.split(/(\|\|.*?\|\|)/g);
    return (
      <span className={className}>
        {parts.map((part, index) => {
          if (part.startsWith("||") && part.endsWith("||")) {
            const secret = part.slice(2, -2);
            return (
              <InlineRedacted key={index}>
                {secret}
              </InlineRedacted>
            );
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
      onClick={() => setRevealed(!revealed)}
      title={revealed ? "Click to Re-Censor" : "CLASSIFIED // Click to Declassify"}
      className={`redacted-tape ${revealed ? "revealed" : ""}`}
    >
      {revealed ? children : "█".repeat(12)}
    </span>
  );
}
