"use client";

import { useEffect } from "react";

/** Last-resort boundary — replaces the root layout if it (or a provider) throws. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ maxWidth: 380, padding: 24, textAlign: "center" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>PocketPilot hit a snag</h2>
          <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 20 }}>
            The app failed to load. Your data is safe — please try again.
          </p>
          <button
            onClick={reset}
            style={{
              border: "none",
              borderRadius: 10,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: "#fafafa",
              color: "#0a0a0a",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
