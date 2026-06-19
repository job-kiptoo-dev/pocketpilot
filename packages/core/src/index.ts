// @pocketpilot/core — shared finance engine, types and M-Pesa parsing.
// Pure, platform-agnostic: consumed by both the Next.js web app and the
// Expo mobile app.

export * from "./types";
export * from "./money";
export * from "./categories";
export * from "./status";

export * from "./mpesa/parse";

export * from "./finance/util";
export * from "./finance/health";
export * from "./finance/forecast";
export * from "./finance/survival";
export * from "./finance/buffer";
export * from "./finance/opportunities";
export * from "./finance/savings";
export * from "./finance/simulator";
export * from "./finance/accounts";

export * from "./assistant/local";

export * from "./db/repository";
export * from "./db/memory";
export * from "./db/fixtures";
