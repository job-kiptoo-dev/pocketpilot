module.exports = [
"[project]/apps/web/src/lib/supabase/config.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Supabase env access. When unset, the app runs in local-seed mode (no auth,
// no realtime) so development works before credentials exist.
__turbopack_context__.s([
    "getSupabaseEnv",
    ()=>getSupabaseEnv,
    "isSupabaseConfigured",
    ()=>isSupabaseConfigured,
    "requireSupabaseEnv",
    ()=>requireSupabaseEnv
]);
function getSupabaseEnv() {
    return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    };
}
function isSupabaseConfigured() {
    const { url, anonKey } = getSupabaseEnv();
    return Boolean(url && anonKey);
}
function requireSupabaseEnv() {
    const { url, anonKey } = getSupabaseEnv();
    if (!url || !anonKey) {
        throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    return {
        url,
        anonKey
    };
}
}),
"[project]/packages/core/src/categories.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CATEGORIES",
    ()=>CATEGORIES,
    "CATEGORY_META",
    ()=>CATEGORY_META,
    "SPEND_CATEGORIES",
    ()=>SPEND_CATEGORIES,
    "categoryColor",
    ()=>categoryColor
]);
const CATEGORIES = [
    "Food",
    "Transport",
    "Rent",
    "Entertainment",
    "Savings",
    "Airtime",
    "Data Bundles",
    "Income",
    "Miscellaneous"
];
const SPEND_CATEGORIES = CATEGORIES.filter((c)=>c !== "Income");
const CATEGORY_META = {
    Food: {
        emoji: "🍲",
        color: "var(--chart-1)"
    },
    Transport: {
        emoji: "🚌",
        color: "var(--chart-2)"
    },
    Rent: {
        emoji: "🏠",
        color: "var(--chart-4)"
    },
    Entertainment: {
        emoji: "🎬",
        color: "var(--chart-5)"
    },
    Savings: {
        emoji: "🐷",
        color: "var(--chart-1)"
    },
    Airtime: {
        emoji: "📞",
        color: "var(--chart-3)"
    },
    "Data Bundles": {
        emoji: "📶",
        color: "var(--chart-2)"
    },
    Income: {
        emoji: "💰",
        color: "var(--chart-1)"
    },
    Miscellaneous: {
        emoji: "🛍️",
        color: "var(--chart-3)"
    }
};
function categoryColor(category) {
    return CATEGORY_META[category].color;
}
}),
"[project]/packages/core/src/money.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Integer-cents money helpers. 1 KES = 100 cents.
/** Convert a KES decimal (e.g. 135.00) to integer cents. */ __turbopack_context__.s([
    "formatKes",
    ()=>formatKes,
    "parseKesAmount",
    ()=>parseKesAmount,
    "toCents",
    ()=>toCents,
    "toKes",
    ()=>toKes
]);
function toCents(kes) {
    return Math.round(kes * 100);
}
function toKes(cents) {
    return cents / 100;
}
function formatKes(cents, opts = {}) {
    const kes = cents / 100;
    if (opts.compact && Math.abs(kes) >= 1000) {
        return "KSh " + formatCompact(kes);
    }
    const decimals = opts.decimals ?? true;
    return "KSh " + kes.toLocaleString("en-KE", {
        minimumFractionDigits: decimals ? 2 : 0,
        maximumFractionDigits: decimals ? 2 : 0
    });
}
function formatCompact(kes) {
    const abs = Math.abs(kes);
    const sign = kes < 0 ? "-" : "";
    if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}K`;
    return `${sign}${abs.toFixed(0)}`;
}
function parseKesAmount(raw) {
    const match = raw.replace(/ksh/gi, "").match(/[\d,]+(?:\.\d{1,2})?/);
    if (!match) return null;
    const value = Number(match[0].replace(/,/g, ""));
    if (Number.isNaN(value)) return null;
    return toCents(value);
}
}),
"[project]/packages/core/src/mpesa/parse.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "parseMpesa",
    ()=>parseMpesa,
    "parseMpesaBatch",
    ()=>parseMpesaBatch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/money.ts [app-ssr] (ecmascript)");
;
const AMOUNT = String.raw`Ksh[\s]?[\d,]+(?:\.\d{1,2})?`;
/** Pull the "New M-PESA balance is Ksh..." value, if present. */ function extractBalance(text) {
    const m = text.match(new RegExp(String.raw`balance\s+is\s+(${AMOUNT})`, "i"));
    if (!m) return undefined;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseKesAmount"])(m[1]) ?? undefined;
}
/** Pull the M-Pesa transaction code (first token, e.g. "WEF1A2B3C4"). */ function extractCode(text) {
    const m = text.match(/\b([A-Z]{2,3}[A-Z0-9]{6,9})\b/);
    return m?.[1];
}
/** Parse a date like "5/6/26" or "5/6/2026" plus optional time into ISO. */ function extractDate(text) {
    const m = text.match(/on\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i);
    if (!m) return new Date().toISOString();
    const [, dd, mm, yy, hh, min, ampm] = m;
    let year = Number(yy);
    if (year < 100) year += 2000;
    let hour = hh ? Number(hh) : 12;
    if (ampm) {
        const isPm = ampm.toUpperCase() === "PM";
        if (isPm && hour < 12) hour += 12;
        if (!isPm && hour === 12) hour = 0;
    }
    const d = new Date(year, Number(mm) - 1, Number(dd), hour, min ? Number(min) : 0);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
}
function cleanMerchant(raw) {
    return raw.replace(/\b\d{9,12}\b/g, "") // strip phone numbers
    .replace(/\s+/g, " ").replace(/[.,]+$/, "").trim();
}
const TRANSPORT_HINTS = /sacco|matatu|transport|fuel|petrol|shell|total|rubis|uber|bolt|little|fare/i;
const FOOD_HINTS = /enterprise|food|hotel|restaurant|cafe|kibanda|butchery|grocer|supermarket|mart|kitchen|eatery|bakery|naivas|carrefour|quickmart/i;
const RENT_HINTS = /rent|landlord|apartment|housing|caretaker/i;
const ENT_HINTS = /bet|sportpesa|odibet|netflix|showmax|dstv|gotv|cinema|bar|club|spotify/i;
/** Guess a category for a "paid to"/"sent to" merchant. */ function guessCategory(merchant, direction) {
    if (direction === "in") return "Income";
    if (TRANSPORT_HINTS.test(merchant)) return "Transport";
    if (RENT_HINTS.test(merchant)) return "Rent";
    if (ENT_HINTS.test(merchant)) return "Entertainment";
    if (FOOD_HINTS.test(merchant)) return "Food";
    return "Miscellaneous";
}
const RULES = [
    // Received money
    {
        test: new RegExp(String.raw`received\s+(${AMOUNT})\s+from\s+([A-Za-z0-9 .'&-]+?)(?:\s+on\b|\.)`, "i"),
        build: (_t, m)=>({
                amount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseKesAmount"])(m[1]),
                direction: "in",
                merchant: cleanMerchant(m[2]),
                category: "Income"
            })
    },
    // Airtime
    {
        test: new RegExp(String.raw`bought\s+(${AMOUNT})\s+of\s+airtime`, "i"),
        build: (_t, m)=>({
                amount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseKesAmount"])(m[1]),
                direction: "out",
                merchant: "Airtime",
                category: "Airtime"
            })
    },
    // Data bundles
    {
        test: new RegExp(String.raw`(${AMOUNT}).{0,40}?(?:data|bundle)`, "i"),
        build: (_t, m)=>({
                amount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseKesAmount"])(m[1]),
                direction: "out",
                merchant: "Data Bundles",
                category: "Data Bundles"
            })
    },
    // Cash withdrawal
    {
        test: new RegExp(String.raw`(?:withdraw|give)\s+(${AMOUNT})\s+from\s+([A-Za-z0-9 .'&-]+?)(?:\s+New\b|\.\s+New|\.)`, "i"),
        build: (_t, m)=>({
                amount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseKesAmount"])(m[1]),
                direction: "out",
                merchant: cleanMerchant(m[2]) || "Cash Withdrawal",
                category: "Miscellaneous"
            })
    },
    // Paid to (buy goods / pay bill)
    {
        test: new RegExp(String.raw`(${AMOUNT})\s+paid\s+to\s+([A-Za-z0-9 .'&-]+?)(?:\s+on\b|\.\s|\.$)`, "i"),
        build: (_t, m)=>{
            const merchant = cleanMerchant(m[2]);
            return {
                amount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseKesAmount"])(m[1]),
                direction: "out",
                merchant,
                category: guessCategory(merchant, "out")
            };
        }
    },
    // Sent to (send money)
    {
        test: new RegExp(String.raw`(${AMOUNT})\s+sent\s+to\s+([A-Za-z0-9 .'&-]+?)(?:\s+on\b|\s+\d{9,}|\.\s|\.$)`, "i"),
        build: (_t, m)=>{
            const merchant = cleanMerchant(m[2]);
            return {
                amount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseKesAmount"])(m[1]),
                direction: "out",
                merchant,
                category: guessCategory(merchant, "out")
            };
        }
    }
];
function parseMpesa(raw) {
    const text = raw.trim();
    if (!text) return null;
    for (const rule of RULES){
        const m = text.match(rule.test);
        if (!m) continue;
        const partial = rule.build(text, m);
        if (!partial.amount || Number.isNaN(partial.amount)) continue;
        return {
            amount: partial.amount,
            direction: partial.direction,
            merchant: partial.merchant || "Unknown",
            category: partial.category ?? "Miscellaneous",
            balanceAfter: extractBalance(text),
            date: extractDate(text),
            code: extractCode(text),
            raw: text,
            source: "sms"
        };
    }
    return null;
}
function parseMpesaBatch(input) {
    return input.split(/\n{2,}|\r?\n(?=[A-Z]{2,3}[A-Z0-9]{6,9}\b)/).map((chunk)=>chunk.trim()).filter(Boolean).map(parseMpesa).filter((t)=>t !== null);
}
}),
"[project]/packages/core/src/finance/util.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MS_PER_DAY",
    ()=>MS_PER_DAY,
    "currentBalance",
    ()=>currentBalance,
    "dayOfMonth",
    ()=>dayOfMonth,
    "daysInMonth",
    ()=>daysInMonth,
    "daysRemainingInMonth",
    ()=>daysRemainingInMonth,
    "daysUntilPayday",
    ()=>daysUntilPayday,
    "isSameMonth",
    ()=>isSameMonth,
    "isSpend",
    ()=>isSpend,
    "monthTransactions",
    ()=>monthTransactions,
    "sum",
    ()=>sum
]);
const MS_PER_DAY = 86_400_000;
function daysInMonth(now) {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}
function dayOfMonth(now) {
    return now.getDate();
}
function daysRemainingInMonth(now) {
    return daysInMonth(now) - dayOfMonth(now);
}
function daysUntilPayday(now, payday) {
    const dim = daysInMonth(now);
    const clampedPayday = Math.min(Math.max(payday, 1), dim);
    let target;
    if (now.getDate() < clampedPayday) {
        target = new Date(now.getFullYear(), now.getMonth(), clampedPayday);
    } else {
        target = new Date(now.getFullYear(), now.getMonth() + 1, payday);
    }
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(1, Math.round((target.getTime() - start.getTime()) / MS_PER_DAY));
}
function isSameMonth(iso, now) {
    const d = new Date(iso);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
function monthTransactions(txs, now) {
    return txs.filter((t)=>isSameMonth(t.date, now));
}
function isSpend(t) {
    return t.direction === "out" && t.category !== "Savings";
}
function currentBalance(data) {
    let latest;
    for (const t of data.transactions){
        if (t.balanceAfter == null) continue;
        if (!latest || new Date(t.date) > new Date(latest.date)) latest = t;
    }
    return latest?.balanceAfter ?? 0;
}
function sum(values) {
    return values.reduce((a, b)=>a + b, 0);
}
}),
"[project]/packages/core/src/finance/health.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeHealth",
    ()=>computeHealth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/util.ts [app-ssr] (ecmascript)");
;
function computeHealth(data, now = new Date()) {
    const monthTx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["monthTransactions"])(data.transactions, now);
    const elapsed = Math.max(1, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["dayOfMonth"])(now));
    const spendTx = monthTx.filter(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSpend"]);
    const monthlySpend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sum"])(spendTx.map((t)=>t.amount));
    const incomeTx = monthTx.filter((t)=>t.direction === "in");
    const monthlyIncome = incomeTx.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sum"])(incomeTx.map((t)=>t.amount)) : data.profile.monthlyIncome;
    const explicitSavings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sum"])(monthTx.filter((t)=>t.category === "Savings").map((t)=>t.amount));
    const dailyAverage = Math.round(monthlySpend / elapsed);
    const sevenDaysAgo = now.getTime() - 7 * __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MS_PER_DAY"];
    const weeklyAverage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sum"])(data.transactions.filter((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSpend"])(t) && new Date(t.date).getTime() >= sevenDaysAgo).map((t)=>t.amount));
    const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.min(1, (monthlyIncome - monthlySpend) / monthlyIncome)) : 0;
    // Composite score: half from savings rate, half from leftover runway.
    const leftoverRatio = monthlyIncome > 0 ? Math.max(0, (monthlyIncome - monthlySpend) / monthlyIncome) : 0;
    const score = Math.round(Math.max(0, Math.min(100, savingsRate * 60 + leftoverRatio * 40)));
    // Category breakdown.
    const byCatMap = new Map();
    for (const t of spendTx)byCatMap.set(t.category, (byCatMap.get(t.category) ?? 0) + t.amount);
    const byCategory = [
        ...byCatMap.entries()
    ].map(([category, amount])=>({
            category,
            amount,
            share: monthlySpend ? amount / monthlySpend : 0
        })).sort((a, b)=>b.amount - a.amount);
    // Daily trend across the month so far.
    const dailyTrend = [];
    for(let day = 1; day <= elapsed; day++){
        const d = new Date(now.getFullYear(), now.getMonth(), day);
        const spend = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sum"])(data.transactions.filter((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSpend"])(t) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSameMonth"])(t.date, now) && new Date(t.date).getDate() === day).map((t)=>t.amount));
        dailyTrend.push({
            date: d.toISOString(),
            label: d.toLocaleDateString("en-KE", {
                month: "short",
                day: "numeric"
            }),
            spend
        });
    }
    return {
        balance: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["currentBalance"])(data),
        dailyAverage,
        weeklyAverage,
        monthlySpend,
        monthlyIncome,
        savingsRate,
        explicitSavings,
        burnRate: dailyAverage,
        score,
        byCategory,
        dailyTrend
    };
}
}),
"[project]/packages/core/src/finance/forecast.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeForecast",
    ()=>computeForecast,
    "recurringDailyCost",
    ()=>recurringDailyCost
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$health$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/health.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/util.ts [app-ssr] (ecmascript)");
;
;
function recurringDailyCost(data) {
    return Math.round(data.recurring.reduce((acc, r)=>acc + r.amountPerCycle / r.cycleDays, 0));
}
function computeForecast(data, now = new Date()) {
    const health = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$health$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeHealth"])(data, now);
    const recurring = recurringDailyCost(data);
    // Use observed spend, but never below the user's own recurring commitments.
    const dailyBurn = Math.max(health.dailyAverage, recurring);
    const daysRemaining = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["daysRemainingInMonth"])(now);
    const balance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["currentBalance"])(data);
    const projectedSpend = dailyBurn * daysRemaining;
    const projectedEndBalance = balance - projectedSpend;
    const daysMoneyLasts = dailyBurn > 0 ? Math.floor(balance / dailyBurn) : Infinity;
    return {
        dailyBurn,
        recurringDailyCost: recurring,
        daysRemaining,
        projectedEndBalance,
        projectedSpend,
        daysMoneyLasts
    };
}
}),
"[project]/packages/core/src/finance/survival.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeSurvival",
    ()=>computeSurvival
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$health$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/health.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$forecast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/forecast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/util.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/money.ts [app-ssr] (ecmascript)");
;
;
;
;
const STATUS_THRESHOLDS = [
    {
        status: "Safe",
        minRatio: 1.5
    },
    {
        status: "Comfortable",
        minRatio: 1.0
    },
    {
        status: "Warning",
        minRatio: 0.6
    },
    {
        status: "Critical",
        minRatio: 0
    }
];
function statusForRatio(ratio) {
    for (const t of STATUS_THRESHOLDS)if (ratio >= t.minRatio) return t.status;
    return "Critical";
}
/** Coefficient-of-variation based confidence in the daily-burn estimate. */ function computeConfidence(data, now) {
    const month = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["monthTransactions"])(data.transactions, now).filter(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSpend"]);
    const daysWithData = new Set(month.map((t)=>new Date(t.date).getDate())).size;
    // Daily spend series for variance.
    const byDay = new Map();
    for (const t of month)byDay.set(new Date(t.date).getDate(), (byDay.get(new Date(t.date).getDate()) ?? 0) + t.amount);
    const series = [
        ...byDay.values()
    ];
    const mean = series.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sum"])(series) / series.length : 0;
    const variance = series.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["sum"])(series.map((v)=>(v - mean) ** 2)) / series.length : 0;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
    // More days of data -> higher; more volatile spend -> lower.
    const dataScore = Math.min(1, daysWithData / 14); // ~2 weeks = full marks
    const stabilityScore = Math.max(0, 1 - cv); // cv 0 -> 1, cv >=1 -> 0
    return Math.round(Math.max(5, Math.min(100, (dataScore * 0.6 + stabilityScore * 0.4) * 100)));
}
function computeSurvival(data, now = new Date()) {
    const health = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$health$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeHealth"])(data, now);
    const balance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["currentBalance"])(data);
    const daysToPayday = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["daysUntilPayday"])(now, data.profile.payday);
    const dailyBurn = Math.max(1, Math.max(health.dailyAverage, (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$forecast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recurringDailyCost"])(data)));
    const daysMoneyLasts = Math.floor(balance / dailyBurn);
    const expectedBalanceAtPayday = balance - dailyBurn * daysToPayday;
    const ratio = daysMoneyLasts / daysToPayday;
    const status = statusForRatio(ratio);
    // Allowance leaves a small buffer (10% of balance) for payday day itself.
    const buffer = Math.round(balance * 0.1);
    const safeDailyAllowance = Math.max(0, Math.floor((balance - buffer) / daysToPayday));
    const confidence = computeConfidence(data, now);
    const recommendations = buildRecommendations({
        status,
        balance,
        daysToPayday,
        dailyBurn,
        safeDailyAllowance,
        expectedBalanceAtPayday,
        topCategory: health.byCategory[0]?.category,
        topShare: health.byCategory[0]?.share ?? 0
    });
    return {
        status,
        balance,
        daysToPayday,
        dailyBurn,
        expectedBalanceAtPayday,
        daysMoneyLasts,
        safeDailyAllowance,
        confidence,
        recommendations
    };
}
function buildRecommendations(ctx) {
    const recs = [];
    recs.push(`Keep daily spending under ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(ctx.safeDailyAllowance, {
        decimals: false
    })} to reach payday safely.`);
    if (ctx.status === "Critical" || ctx.status === "Warning") {
        const overshoot = ctx.dailyBurn - ctx.safeDailyAllowance;
        if (overshoot > 0) {
            recs.push(`You're overspending by about ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(overshoot, {
                decimals: false
            })}/day — trim it to avoid running dry.`);
        }
        if (ctx.expectedBalanceAtPayday < 0) {
            recs.push(`At this rate you'll be short ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(-ctx.expectedBalanceAtPayday, {
                decimals: false
            })} before payday.`);
        }
    } else {
        const surplus = ctx.safeDailyAllowance - ctx.dailyBurn;
        if (surplus > 0) {
            recs.push(`You have ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(surplus, {
                decimals: false
            })}/day of headroom — consider moving some to savings.`);
        }
    }
    if (ctx.topCategory && ctx.topShare > 0.35) {
        recs.push(`${ctx.topCategory} is ${Math.round(ctx.topShare * 100)}% of your spending — your biggest lever.`);
    }
    return recs;
}
}),
"[project]/packages/core/src/finance/savings.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "computeAllGoals",
    ()=>computeAllGoals,
    "computeGoalProgress",
    ()=>computeGoalProgress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/util.ts [app-ssr] (ecmascript)");
;
function computeGoalProgress(goal, now = new Date()) {
    const progress = goal.target > 0 ? Math.min(1, goal.saved / goal.target) : 0;
    const remaining = Math.max(0, goal.target - goal.saved);
    let monthsRemaining = null;
    let suggestedMonthly = null;
    if (goal.deadline) {
        const days = (new Date(goal.deadline).getTime() - now.getTime()) / __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MS_PER_DAY"];
        monthsRemaining = Math.max(0, Math.round(days / 30 * 10) / 10);
        const months = Math.max(1, Math.ceil(days / 30));
        suggestedMonthly = Math.ceil(remaining / months);
    }
    // On track if at least proportionally funded for time elapsed (simple heuristic).
    const onTrack = progress >= 0.5 || monthsRemaining != null && monthsRemaining > 3;
    return {
        goal,
        progress,
        remaining,
        monthsRemaining,
        suggestedMonthly,
        onTrack
    };
}
function computeAllGoals(goals, now = new Date()) {
    return goals.map((g)=>computeGoalProgress(g, now));
}
}),
"[project]/packages/core/src/finance/simulator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "simulatePurchase",
    ()=>simulatePurchase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$survival$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/survival.ts [app-ssr] (ecmascript)");
;
const SAFE_STATUSES = [
    "Safe",
    "Comfortable"
];
function simulatePurchase(data, amountCents, now = new Date(), label) {
    const before = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$survival$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeSurvival"])(data, now);
    // Clone with an adjusted latest balance by injecting a synthetic spend.
    const adjusted = {
        ...data,
        transactions: [
            {
                id: "sim",
                amount: amountCents,
                direction: "out",
                category: "Miscellaneous",
                merchant: label ?? "Simulated purchase",
                balanceAfter: Math.max(0, before.balance - amountCents),
                date: now.toISOString(),
                source: "manual"
            },
            ...data.transactions
        ]
    };
    const after = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$survival$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeSurvival"])(adjusted, now);
    const stillSafe = SAFE_STATUSES.includes(after.status);
    const verdict = buildVerdict(before.status, after.status, stillSafe);
    return {
        amount: amountCents,
        label,
        balanceBefore: before.balance,
        balanceAfter: after.balance,
        statusBefore: before.status,
        statusAfter: after.status,
        expectedAtPaydayBefore: before.expectedBalanceAtPayday,
        expectedAtPaydayAfter: after.expectedBalanceAtPayday,
        stillSafe,
        verdict
    };
}
function buildVerdict(before, after, stillSafe) {
    if (stillSafe) return "Go for it — you'll still be safe until payday.";
    if (before === after) return "Doable, but it keeps you on the edge until payday.";
    return "Risky — this pushes you toward running out before payday.";
}
}),
"[project]/packages/core/src/assistant/local.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "answerLocally",
    ()=>answerLocally
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$health$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/health.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$forecast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/forecast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$survival$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/survival.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$simulator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/simulator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/money.ts [app-ssr] (ecmascript)");
;
;
;
;
;
/** Pull the first KES amount mentioned in a question. */ function extractAmount(q) {
    const m = q.replace(/ksh|kes|sh/gi, "").match(/(\d[\d,]*(?:\.\d+)?)/);
    if (!m) return null;
    const v = Number(m[1].replace(/,/g, ""));
    return Number.isNaN(v) ? null : (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(v);
}
function extractMonths(q) {
    const m = q.match(/(\d+)\s*month/i);
    return m ? Number(m[1]) : null;
}
function answerLocally(data, question, now = new Date()) {
    const q = question.toLowerCase();
    const health = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$health$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeHealth"])(data, now);
    const forecast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$forecast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeForecast"])(data, now);
    const survival = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$survival$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["computeSurvival"])(data, now);
    // Can I afford X?
    if (/(afford|can i (buy|get)|should i (buy|get))/.test(q)) {
        const amount = extractAmount(q);
        if (amount) {
            const sim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$simulator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["simulatePurchase"])(data, amount, now);
            return `If you spend ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(amount)}, your balance drops to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(sim.balanceAfter)} and you'd reach payday with about ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(sim.expectedAtPaydayAfter)}. ${sim.verdict}`;
        }
        return `Tell me the price (e.g. "Can I afford a 1,500 jacket?") and I'll simulate it against your ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(survival.safeDailyAllowance)}/day safe limit.`;
    }
    // Biggest expense
    if (/(biggest|largest|most).*(expense|spend|cost|category)/.test(q) || /where.*money.*go/.test(q)) {
        const top = health.byCategory[0];
        if (!top) return "You haven't recorded any spending yet this month.";
        return `Your biggest expense is ${top.category} at ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(top.amount)} — that's ${Math.round(top.share * 100)}% of your spending this month.`;
    }
    // Month-end balance
    if (/(month.?end|end of (the )?month|finish the month)/.test(q)) {
        return `You're on track to finish the month with about ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(forecast.projectedEndBalance)}, spending roughly ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(forecast.projectedSpend)} more over the next ${forecast.daysRemaining} days.`;
    }
    // Savings in N months
    if (/save/.test(q)) {
        const months = extractMonths(q) ?? 6;
        const monthlySurplus = Math.max(0, health.monthlyIncome - health.monthlySpend);
        return `At your current pace you keep about ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(monthlySurplus)}/month. Over ${months} months that's roughly ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(monthlySurplus * months)} — before topping up your goals.`;
    }
    // Safe / survival
    if (/(safe|survive|make it|payday|run out|broke)/.test(q)) {
        return `You're ${survival.status}. At ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(survival.dailyBurn, {
            decimals: false
        })}/day your balance of ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(survival.balance)} lasts ${survival.daysMoneyLasts} days, and payday is in ${survival.daysToPayday} days. Keep spending under ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(survival.safeDailyAllowance, {
            decimals: false
        })}/day to stay safe.`;
    }
    // How much can I spend
    if (/(how much).*(spend|spending)/.test(q)) {
        return `You can safely spend up to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(survival.safeDailyAllowance, {
            decimals: false
        })} per day and still reach payday in ${survival.daysToPayday} days.`;
    }
    // Balance
    if (/(balance|how much.*(have|left|money))/.test(q)) {
        return `Your current balance is ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(health.balance)}. You've spent ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(health.monthlySpend)} this month.`;
    }
    // Fallback summary
    return `Here's a quick snapshot: balance ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(health.balance)}, ${survival.status} until payday (${survival.daysToPayday} days), spending ~${(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatKes"])(health.dailyAverage, {
        decimals: false
    })}/day. Ask me about affording something, your biggest expense, or your month-end balance.`;
}
}),
"[project]/packages/core/src/db/fixtures.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "seedData",
    ()=>seedData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/money.ts [app-ssr] (ecmascript)");
;
// Realistic Nairobi spending pattern for a young salaried earner.
const DAILY = [
    {
        merchant: "Mama Oliech Lunch",
        category: "Food",
        kes: 160
    },
    {
        merchant: "Embassava Sacco",
        category: "Transport",
        kes: 100
    },
    {
        merchant: "Soko Eggs Vendor",
        category: "Food",
        kes: 30
    },
    {
        merchant: "Indomie Duka",
        category: "Food",
        kes: 135,
        everyDays: 2
    }
];
const WEEKLY = [
    {
        merchant: "Safaricom Airtime",
        category: "Airtime",
        kes: 50,
        everyDays: 7
    },
    {
        merchant: "Safaricom Data Bundles",
        category: "Data Bundles",
        kes: 100,
        everyDays: 7
    },
    {
        merchant: "Naivas Supermarket",
        category: "Food",
        kes: 1200,
        everyDays: 7
    },
    {
        merchant: "Sportpesa",
        category: "Entertainment",
        kes: 300,
        everyDays: 6
    }
];
const ONE_OFFS = [
    {
        merchant: "Salary - Acme Ltd",
        category: "Income",
        kes: 60000,
        onDay: 1,
        direction: "in"
    },
    {
        merchant: "Monthly Rent",
        category: "Rent",
        kes: 15000,
        onDay: 3
    },
    {
        merchant: "M-Shwari Lock Savings",
        category: "Savings",
        kes: 5000,
        onDay: 2
    },
    {
        merchant: "KPLC Tokens",
        category: "Miscellaneous",
        kes: 1000,
        onDay: 4
    },
    {
        merchant: "Java House",
        category: "Food",
        kes: 850,
        onDay: 8
    },
    {
        merchant: "Bolt Ride",
        category: "Transport",
        kes: 420,
        onDay: 11
    }
];
const OPENING_BALANCE_KES = 3200;
function makeId(seed) {
    return "seed-" + seed.toString(36).padStart(5, "0");
}
function seedData(now = new Date()) {
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const pending = [];
    for(let day = 1; day <= today; day++){
        for (const def of [
            ...DAILY,
            ...WEEKLY
        ]){
            const every = def.everyDays ?? 1;
            if ((day - 1) % every === 0) pending.push({
                day,
                def
            });
        }
        for (const def of ONE_OFFS){
            if (def.onDay === day) pending.push({
                day,
                def
            });
        }
    }
    // Chronological order so the running balance is correct.
    pending.sort((a, b)=>a.day - b.day);
    let balance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(OPENING_BALANCE_KES);
    let seed = 1;
    const transactions = pending.map(({ day, def })=>{
        const amount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(def.kes);
        const direction = def.direction ?? "out";
        balance += direction === "in" ? amount : -amount;
        // Spread transactions across the day for a believable timeline.
        const hour = 7 + seed * 3 % 12;
        const date = new Date(year, month, day, hour, seed * 7 % 60).toISOString();
        return {
            id: makeId(seed++),
            amount,
            direction,
            category: def.category,
            merchant: def.merchant,
            balanceAfter: balance,
            date,
            source: "manual"
        };
    });
    transactions.reverse(); // newest first
    return {
        profile: {
            name: "Brian",
            payday: 1,
            monthlyIncome: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(60000)
        },
        transactions,
        recurring: [
            {
                id: "rec-lunch",
                label: "Lunch",
                category: "Food",
                amountPerCycle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(160),
                cycleDays: 1
            },
            {
                id: "rec-transport",
                label: "Transport",
                category: "Transport",
                amountPerCycle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(100),
                cycleDays: 1
            },
            {
                id: "rec-eggs",
                label: "Eggs",
                category: "Food",
                amountPerCycle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(30),
                cycleDays: 1
            },
            {
                id: "rec-indomie",
                label: "Indomie",
                category: "Food",
                amountPerCycle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(135),
                cycleDays: 2
            },
            {
                id: "rec-airtime",
                label: "Airtime",
                category: "Airtime",
                amountPerCycle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(50),
                cycleDays: 7
            },
            {
                id: "rec-bundles",
                label: "Data Bundles",
                category: "Data Bundles",
                amountPerCycle: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(100),
                cycleDays: 7
            }
        ],
        goals: [
            {
                id: "goal-emergency",
                name: "Emergency Fund",
                emoji: "🛟",
                target: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(50000),
                saved: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(18500),
                deadline: isoMonthsAhead(now, 6)
            },
            {
                id: "goal-laptop",
                name: "Laptop Upgrade",
                emoji: "💻",
                target: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(85000),
                saved: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(22000),
                deadline: isoMonthsAhead(now, 8)
            },
            {
                id: "goal-phone",
                name: "New Phone",
                emoji: "📱",
                target: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(35000),
                saved: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$money$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toCents"])(9000),
                deadline: isoMonthsAhead(now, 4)
            }
        ]
    };
}
function isoMonthsAhead(now, months) {
    const d = new Date(now.getFullYear(), now.getMonth() + months, now.getDate());
    return d.toISOString();
}
}),
"[project]/packages/core/src/db/memory.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MemoryRepository",
    ()=>MemoryRepository,
    "genId",
    ()=>genId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/db/fixtures.ts [app-ssr] (ecmascript)");
;
function genId(prefix = "tx") {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
class MemoryRepository {
    data;
    constructor(initial){
        this.data = initial ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seedData"])();
    }
    async load() {
        return this.data;
    }
    async addTransaction(tx) {
        const created = {
            ...tx,
            id: genId()
        };
        this.data.transactions = [
            created,
            ...this.data.transactions
        ];
        return created;
    }
    async deleteTransaction(id) {
        this.data.transactions = this.data.transactions.filter((t)=>t.id !== id);
    }
    async upsertRecurring(expense) {
        const i = this.data.recurring.findIndex((r)=>r.id === expense.id);
        if (i >= 0) this.data.recurring[i] = expense;
        else this.data.recurring.push(expense);
    }
    async deleteRecurring(id) {
        this.data.recurring = this.data.recurring.filter((r)=>r.id !== id);
    }
    async upsertGoal(goal) {
        const i = this.data.goals.findIndex((g)=>g.id === goal.id);
        if (i >= 0) this.data.goals[i] = goal;
        else this.data.goals.push(goal);
    }
    async deleteGoal(id) {
        this.data.goals = this.data.goals.filter((g)=>g.id !== id);
    }
}
}),
"[project]/packages/core/src/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// @pocketpilot/core — shared finance engine, types and M-Pesa parsing.
// Pure, platform-agnostic: consumed by both the Next.js web app and the
// Expo mobile app.
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$categories$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/categories.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$mpesa$2f$parse$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/mpesa/parse.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$health$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/health.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$forecast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/forecast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$survival$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/survival.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$savings$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/savings.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$simulator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/simulator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$assistant$2f$local$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/assistant/local.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$memory$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/db/memory.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/db/fixtures.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
}),
"[project]/apps/web/src/lib/store/context.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreContext",
    ()=>StoreContext,
    "useStore",
    ()=>useStore,
    "withComputedBalance",
    ()=>withComputedBalance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/finance/util.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$memory$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/db/memory.ts [app-ssr] (ecmascript)");
"use client";
;
;
const StoreContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
function useStore() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(StoreContext);
    if (!ctx) throw new Error("useStore must be used within <StoreProvider>");
    return ctx;
}
function withComputedBalance(data, tx) {
    const balance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$finance$2f$util$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["currentBalance"])(data);
    const balanceAfter = tx.balanceAfter ?? (tx.direction === "in" ? balance + tx.amount : balance - tx.amount);
    return {
        ...tx,
        balanceAfter,
        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$memory$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["genId"])()
    };
}
}),
"[project]/apps/web/src/lib/store/local-store.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LocalStoreProvider",
    ()=>LocalStoreProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$mpesa$2f$parse$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/mpesa/parse.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/db/fixtures.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/context.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const STORAGE_KEY = "pocketpilot:data:v1";
function LocalStoreProvider({ children }) {
    const [now] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new Date());
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seedData"])(now));
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (raw) setData(JSON.parse(raw));
        } catch  {
        // ignore corrupt storage
        }
        setHydrated(true);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch  {
        // ignore quota errors
        }
    }, [
        data,
        hydrated
    ]);
    const addTransaction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((tx)=>{
        let created;
        setData((prev)=>{
            created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["withComputedBalance"])(prev, tx);
            return {
                ...prev,
                transactions: [
                    created,
                    ...prev.transactions
                ]
            };
        });
        return created;
    }, []);
    const addFromSms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((raw)=>{
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$mpesa$2f$parse$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseMpesa"])(raw);
        if (!parsed) return {
            ok: false,
            raw
        };
        return {
            ok: true,
            tx: addTransaction(parsed)
        };
    }, [
        addTransaction
    ]);
    const deleteTransaction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setData((prev)=>({
                ...prev,
                transactions: prev.transactions.filter((t)=>t.id !== id)
            }));
    }, []);
    const upsertGoal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((goal)=>{
        setData((prev)=>{
            const i = prev.goals.findIndex((g)=>g.id === goal.id);
            const goals = [
                ...prev.goals
            ];
            if (i >= 0) goals[i] = goal;
            else goals.push(goal);
            return {
                ...prev,
                goals
            };
        });
    }, []);
    const contributeToGoal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, amountCents)=>{
        setData((prev)=>({
                ...prev,
                goals: prev.goals.map((g)=>g.id === id ? {
                        ...g,
                        saved: g.saved + amountCents
                    } : g)
            }));
    }, []);
    const reset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setData((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$db$2f$fixtures$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["seedData"])(new Date())), []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            data,
            now,
            hydrated,
            live: true,
            addTransaction,
            addFromSms,
            deleteTransaction,
            upsertGoal,
            contributeToGoal,
            reset
        }), [
        data,
        now,
        hydrated,
        addTransaction,
        addFromSms,
        deleteTransaction,
        upsertGoal,
        contributeToGoal,
        reset
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StoreContext"].Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/lib/store/local-store.tsx",
        lineNumber: 82,
        columnNumber: 10
    }, this);
}
}),
"[project]/packages/supabase/src/mappers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Map between database rows and the @pocketpilot/core domain model.
__turbopack_context__.s([
    "goalToRow",
    ()=>goalToRow,
    "recurringToRow",
    ()=>recurringToRow,
    "rowToGoal",
    ()=>rowToGoal,
    "rowToProfile",
    ()=>rowToProfile,
    "rowToRecurring",
    ()=>rowToRecurring,
    "rowToTransaction",
    ()=>rowToTransaction,
    "transactionToInsert",
    ()=>transactionToInsert
]);
function rowToTransaction(r) {
    return {
        id: r.id,
        amount: r.amount,
        direction: r.direction,
        category: r.category,
        merchant: r.merchant,
        balanceAfter: r.balance_after ?? undefined,
        date: r.occurred_at,
        raw: r.raw ?? undefined,
        code: r.code ?? undefined,
        source: r.source,
        note: r.note ?? undefined
    };
}
function transactionToInsert(t, userId) {
    return {
        user_id: userId,
        amount: t.amount,
        direction: t.direction,
        category: t.category,
        merchant: t.merchant,
        balance_after: t.balanceAfter ?? null,
        occurred_at: t.date,
        raw: t.raw ?? null,
        code: t.code ?? null,
        source: t.source,
        note: t.note ?? null
    };
}
function rowToRecurring(r) {
    return {
        id: r.id,
        label: r.label,
        category: r.category,
        amountPerCycle: r.amount_per_cycle,
        cycleDays: r.cycle_days
    };
}
function recurringToRow(e, userId) {
    return {
        id: e.id,
        user_id: userId,
        label: e.label,
        category: e.category,
        amount_per_cycle: e.amountPerCycle,
        cycle_days: e.cycleDays
    };
}
function rowToGoal(r) {
    return {
        id: r.id,
        name: r.name,
        target: r.target,
        saved: r.saved,
        deadline: r.deadline ?? undefined,
        emoji: r.emoji ?? undefined
    };
}
function goalToRow(g, userId) {
    return {
        id: g.id,
        user_id: userId,
        name: g.name,
        target: g.target,
        saved: g.saved,
        deadline: g.deadline ?? null,
        emoji: g.emoji ?? null
    };
}
function rowToProfile(r) {
    return {
        name: r.name,
        payday: r.payday,
        monthlyIncome: r.monthly_income
    };
}
}),
"[project]/packages/supabase/src/repository.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SupabaseRepository",
    ()=>SupabaseRepository,
    "createSupabaseRepository",
    ()=>createSupabaseRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/supabase/src/mappers.ts [app-ssr] (ecmascript)");
;
const DEFAULT_PROFILE = {
    name: "there",
    payday: 1,
    monthlyIncome: 0
};
class SupabaseRepository {
    client;
    userId;
    constructor(client, userId){
        this.client = client;
        this.userId = userId;
    }
    async load() {
        const [profileRes, txRes, recRes, goalRes] = await Promise.all([
            this.client.from("profiles").select("*").eq("id", this.userId).maybeSingle(),
            this.client.from("transactions").select("*").order("occurred_at", {
                ascending: false
            }),
            this.client.from("recurring_expenses").select("*").order("created_at", {
                ascending: true
            }),
            this.client.from("savings_goals").select("*").order("created_at", {
                ascending: true
            })
        ]);
        return {
            profile: profileRes.data ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rowToProfile"])(profileRes.data) : DEFAULT_PROFILE,
            transactions: (txRes.data ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rowToTransaction"]),
            recurring: (recRes.data ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rowToRecurring"]),
            goals: (goalRes.data ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rowToGoal"])
        };
    }
    async addTransaction(tx) {
        const insert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transactionToInsert"])(tx, this.userId);
        // SMS messages carry a unique M-Pesa code -> ignore duplicate ingests.
        if (insert.code) {
            const { data, error } = await this.client.from("transactions").upsert(insert, {
                onConflict: "user_id,code",
                ignoreDuplicates: true
            }).select().maybeSingle();
            if (error) throw error;
            if (data) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rowToTransaction"])(data);
            // Duplicate was ignored; return the existing row.
            const existing = await this.client.from("transactions").select("*").eq("code", insert.code).maybeSingle();
            if (existing.data) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rowToTransaction"])(existing.data);
        }
        const { data, error } = await this.client.from("transactions").insert(insert).select().single();
        if (error) throw error;
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rowToTransaction"])(data);
    }
    async deleteTransaction(id) {
        const { error } = await this.client.from("transactions").delete().eq("id", id);
        if (error) throw error;
    }
    async upsertRecurring(expense) {
        const { error } = await this.client.from("recurring_expenses").upsert((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recurringToRow"])(expense, this.userId));
        if (error) throw error;
    }
    async deleteRecurring(id) {
        const { error } = await this.client.from("recurring_expenses").delete().eq("id", id);
        if (error) throw error;
    }
    async upsertGoal(goal) {
        const { error } = await this.client.from("savings_goals").upsert((0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$mappers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["goalToRow"])(goal, this.userId));
        if (error) throw error;
    }
    async deleteGoal(id) {
        const { error } = await this.client.from("savings_goals").delete().eq("id", id);
        if (error) throw error;
    }
    async updateProfile(profile) {
        const { error } = await this.client.from("profiles").upsert({
            id: this.userId,
            name: profile.name,
            payday: profile.payday,
            monthly_income: profile.monthlyIncome
        });
        if (error) throw error;
    }
}
function createSupabaseRepository(client, userId) {
    return new SupabaseRepository(client, userId);
}
}),
"[project]/packages/supabase/src/index.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

// @pocketpilot/supabase — typed Supabase data layer shared by web + mobile.
// Platform-specific client creation (Next.js SSR cookies, Expo AsyncStorage)
// lives in each app; this package is framework-agnostic.
__turbopack_context__.s([
    "createSupabaseClient",
    ()=>createSupabaseClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/supabase/src/repository.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$108$2e$2$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+supabase-js@2.108.2/node_modules/@supabase/supabase-js/dist/index.mjs [app-ssr] (ecmascript) <locals>");
;
;
;
;
;
function createSupabaseClient(url, anonKey, options) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$supabase$2d$js$40$2$2e$108$2e$2$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(url, anonKey, options);
}
}),
"[project]/packages/supabase/src/realtime.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "subscribeToUserData",
    ()=>subscribeToUserData
]);
function subscribeToUserData(client, userId, onChange) {
    const tables = [
        "transactions",
        "recurring_expenses",
        "savings_goals",
        "profiles"
    ];
    const channel = client.channel(`pocketpilot:${userId}`);
    for (const table of tables){
        const filter = table === "profiles" ? `id=eq.${userId}` : `user_id=eq.${userId}`;
        channel.on("postgres_changes", {
            event: "*",
            schema: "public",
            table,
            filter
        }, (payload)=>onChange({
                table,
                eventType: payload.eventType
            }));
    }
    channel.subscribe();
    return ()=>{
        void client.removeChannel(channel);
    };
}
}),
"[project]/apps/web/src/lib/supabase/client.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getBrowserSupabase",
    ()=>getBrowserSupabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$7$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$108$2e$2$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.7.0_@supabase+supabase-js@2.108.2/node_modules/@supabase/ssr/dist/module/index.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$7$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$108$2e$2$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@supabase+ssr@0.7.0_@supabase+supabase-js@2.108.2/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/supabase/config.ts [app-ssr] (ecmascript)");
"use client";
;
;
let browserClient;
function getBrowserSupabase() {
    if (browserClient) return browserClient;
    const { url, anonKey } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["requireSupabaseEnv"])();
    browserClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$supabase$2b$ssr$40$0$2e$7$2e$0_$40$supabase$2b$supabase$2d$js$40$2$2e$108$2e$2$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createBrowserClient"])(url, anonKey);
    return browserClient;
}
}),
"[project]/apps/web/src/lib/store/supabase-store.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SupabaseStoreProvider",
    ()=>SupabaseStoreProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/core/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$mpesa$2f$parse$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/core/src/mpesa/parse.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/packages/supabase/src/index.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/supabase/src/repository.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$realtime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/packages/supabase/src/realtime.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/context.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const EMPTY = {
    profile: {
        name: "",
        payday: 1,
        monthlyIncome: 0
    },
    transactions: [],
    recurring: [],
    goals: []
};
function SupabaseStoreProvider({ children }) {
    const [now] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new Date());
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(EMPTY);
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [live, setLive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const repoRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const reload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const repo = repoRef.current;
        if (!repo) return;
        try {
            setData(await repo.load());
        } catch (err) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Failed to sync", {
                description: err instanceof Error ? err.message : undefined
            });
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBrowserSupabase"])();
        let unsubscribe;
        let reloadTimer;
        (async ()=>{
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setHydrated(true);
                return;
            }
            repoRef.current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$repository$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createSupabaseRepository"])(supabase, user.id);
            await reload();
            setHydrated(true);
            unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$supabase$2f$src$2f$realtime$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subscribeToUserData"])(supabase, user.id, ()=>{
                // Debounce bursts of changes into a single reload.
                clearTimeout(reloadTimer);
                reloadTimer = setTimeout(reload, 120);
            });
            setLive(true);
        })();
        return ()=>{
            clearTimeout(reloadTimer);
            unsubscribe?.();
        };
    }, [
        reload
    ]);
    const addTransaction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((tx)=>{
        let created;
        setData((prev)=>{
            created = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["withComputedBalance"])(prev, tx);
            return {
                ...prev,
                transactions: [
                    created,
                    ...prev.transactions
                ]
            };
        });
        repoRef.current?.addTransaction(tx).catch((err)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$sonner$40$2$2e$0$2e$7_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error("Couldn't save transaction", {
                description: err instanceof Error ? err.message : undefined
            }));
        return created;
    }, []);
    const addFromSms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((raw)=>{
        const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$packages$2f$core$2f$src$2f$mpesa$2f$parse$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseMpesa"])(raw);
        if (!parsed) return {
            ok: false,
            raw
        };
        return {
            ok: true,
            tx: addTransaction(parsed)
        };
    }, [
        addTransaction
    ]);
    const deleteTransaction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id)=>{
        setData((prev)=>({
                ...prev,
                transactions: prev.transactions.filter((t)=>t.id !== id)
            }));
        repoRef.current?.deleteTransaction(id).catch(()=>void reload());
    }, [
        reload
    ]);
    const upsertGoal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((goal)=>{
        setData((prev)=>{
            const i = prev.goals.findIndex((g)=>g.id === goal.id);
            const goals = [
                ...prev.goals
            ];
            if (i >= 0) goals[i] = goal;
            else goals.push(goal);
            return {
                ...prev,
                goals
            };
        });
        repoRef.current?.upsertGoal(goal).catch(()=>void reload());
    }, [
        reload
    ]);
    const contributeToGoal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((id, amountCents)=>{
        let updated;
        setData((prev)=>{
            const goals = prev.goals.map((g)=>{
                if (g.id !== id) return g;
                updated = {
                    ...g,
                    saved: g.saved + amountCents
                };
                return updated;
            });
            return {
                ...prev,
                goals
            };
        });
        if (updated) repoRef.current?.upsertGoal(updated).catch(()=>void reload());
    }, [
        reload
    ]);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            data,
            now,
            hydrated,
            live,
            addTransaction,
            addFromSms,
            deleteTransaction,
            upsertGoal,
            contributeToGoal,
            reset: reload
        }), [
        data,
        now,
        hydrated,
        live,
        addTransaction,
        addFromSms,
        deleteTransaction,
        upsertGoal,
        contributeToGoal,
        reload
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["StoreContext"].Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/lib/store/supabase-store.tsx",
        lineNumber: 131,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/lib/store/store.tsx [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>StoreProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/supabase/config.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$local$2d$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/local-store.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$supabase$2d$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/supabase-store.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/context.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function StoreProvider({ children }) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$supabase$2d$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SupabaseStoreProvider"], {
            children: children
        }, void 0, false, {
            fileName: "[project]/apps/web/src/lib/store/store.tsx",
            lineNumber: 16,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$local$2d$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LocalStoreProvider"], {
        children: children
    }, void 0, false, {
        fileName: "[project]/apps/web/src/lib/store/store.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
}),
"[project]/apps/web/src/lib/store/store.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["StoreProvider"],
    "useStore",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/store.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/context.ts [app-ssr] (ecmascript)");
}),
"[project]/apps/web/src/lib/utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$3$2e$6$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/tailwind-merge@3.6.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$tailwind$2d$merge$40$3$2e$6$2e$0$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$clsx$40$2$2e$1$2e$1$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
}),
"[project]/apps/web/src/components/ui/button.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$base$2d$ui$2b$react$40$1$2e$5$2e$0_$40$types$2b$react$40$19$2e$2$2e$17_date$2d$fns$40$4$2e$4$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@base-ui+react@1.5.0_@types+react@19.2.17_date-fns@4.4.0_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/@base-ui/react/esm/button/Button.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/utils.ts [app-ssr] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$class$2d$variance$2d$authority$40$0$2e$7$2e$1$2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/80",
            outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
            ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
            destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
            xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
            sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
            lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
            icon: "size-8",
            "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
            "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
            "icon-lg": "size-9"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button({ className, variant = "default", size = "default", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$base$2d$ui$2b$react$40$1$2e$5$2e$0_$40$types$2b$react$40$19$2e$2$2e$17_date$2d$fns$40$4$2e$4$2e$0_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$button$2f$Button$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/ui/button.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
;
}),
"[project]/apps/web/src/components/theme-toggle.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeToggle",
    ()=>ThemeToggle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.20.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/moon.mjs [app-ssr] (ecmascript) <export default as Moon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.20.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/sun.mjs [app-ssr] (ecmascript) <export default as Sun>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-themes@0.4.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/button.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function ThemeToggle() {
    const { resolvedTheme, setTheme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$themes$40$0$2e$4$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTheme"])();
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Standard next-themes guard: only know the resolved theme after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>setMounted(true), []);
    const isDark = resolvedTheme === "dark";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
        variant: "ghost",
        size: "icon",
        "aria-label": "Toggle theme",
        onClick: ()=>setTheme(isDark ? "light" : "dark"),
        className: "rounded-full",
        children: mounted && isDark ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sun$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sun$3e$__["Sun"], {
            className: "size-5"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/theme-toggle.tsx",
            lineNumber: 25,
            columnNumber: 28
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$moon$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Moon$3e$__["Moon"], {
            className: "size-5"
        }, void 0, false, {
            fileName: "[project]/apps/web/src/components/theme-toggle.tsx",
            lineNumber: 25,
            columnNumber: 57
        }, this)
    }, void 0, false, {
        fileName: "[project]/apps/web/src/components/theme-toggle.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/user-menu.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "UserMenu",
    ()=>UserMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.20.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/log-out.mjs [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/ui/button.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/supabase/config.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/supabase/client.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$store$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/store.tsx [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/store/context.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function UserMenu() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { live } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$store$2f$context$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useStore"])();
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$config$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isSupabaseConfigured"])()) return null;
    async function signOut() {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getBrowserSupabase"])().auth.signOut();
        router.replace("/login");
        router.refresh();
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `size-2 rounded-full ${live ? "animate-pulse bg-[color:var(--safe)]" : "bg-muted-foreground"}`
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/user-menu.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    live ? "Live" : "Connecting…"
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/user-menu.tsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Button"], {
                variant: "ghost",
                size: "icon",
                "aria-label": "Sign out",
                onClick: signOut,
                className: "rounded-full",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                    className: "size-5"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/user-menu.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/user-menu.tsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/user-menu.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
"[project]/apps/web/src/components/app-shell.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppShell",
    ()=>AppShell
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.2.9_@babel+core@7.29.7_@opentelemetry+api@1.9.1_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.20.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/layout-dashboard.mjs [app-ssr] (ecmascript) <export default as LayoutDashboard>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Receipt$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.20.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/receipt.mjs [app-ssr] (ecmascript) <export default as Receipt>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.20.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/shield-check.mjs [app-ssr] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.20.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/lucide-react@1.20.0_react@19.2.4/node_modules/lucide-react/dist/esm/icons/wallet.mjs [app-ssr] (ecmascript) <export default as Wallet>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/lib/utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$theme$2d$toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/theme-toggle.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$user$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/src/components/user-menu.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
const NAV = [
    {
        href: "/",
        label: "Dashboard",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layout$2d$dashboard$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LayoutDashboard$3e$__["LayoutDashboard"]
    },
    {
        href: "/transactions",
        label: "Transactions",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$receipt$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Receipt$3e$__["Receipt"]
    },
    {
        href: "/survival",
        label: "Survival",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"]
    },
    {
        href: "/assistant",
        label: "Assistant",
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"]
    }
];
function isActive(href, pathname) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
function AppShell({ children }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-dvh w-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: "sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar/60 px-4 py-6 md:flex",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Brand, {}, void 0, false, {
                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "mt-8 flex flex-col gap-1",
                        children: NAV.map(({ href, label, icon: Icon })=>{
                            const active = isActive(href, pathname);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: href,
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                        className: "size-5"
                                    }, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                        lineNumber: 43,
                                        columnNumber: 17
                                    }, this),
                                    label
                                ]
                            }, href, true, {
                                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                lineNumber: 33,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-auto rounded-2xl border bg-card/60 p-4 text-xs text-muted-foreground",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-medium text-foreground",
                                children: "PocketPilot"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                lineNumber: 50,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1",
                                children: "Your M-Pesa money, finally making sense."
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                lineNumber: 51,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-w-0 flex-1 flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:px-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "md:hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Brand, {
                                    compact: true
                                }, void 0, false, {
                                    fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                    lineNumber: 59,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                lineNumber: 58,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "hidden md:block"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$user$2d$menu$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["UserMenu"], {}, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                        lineNumber: 63,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$components$2f$theme$2d$toggle$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeToggle"], {}, void 0, false, {
                                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                        lineNumber: 64,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                        lineNumber: 57,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10",
                        children: children
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                lineNumber: 56,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t bg-background/90 px-2 py-2 backdrop-blur md:hidden",
                children: NAV.map(({ href, label, icon: Icon })=>{
                    const active = isActive(href, pathname);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: href,
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground"),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                className: "size-5"
                            }, void 0, false, {
                                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                                lineNumber: 84,
                                columnNumber: 15
                            }, this),
                            label
                        ]
                    }, href, true, {
                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                        lineNumber: 76,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/app-shell.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
function Brand({ compact = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        href: "/",
        className: "flex items-center gap-2.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$lucide$2d$react$40$1$2e$20$2e$0_react$40$19$2e$2$2e$4$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$wallet$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Wallet$3e$__["Wallet"], {
                    className: "size-5"
                }, void 0, false, {
                    fileName: "[project]/apps/web/src/components/app-shell.tsx",
                    lineNumber: 98,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            !compact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-lg font-semibold tracking-tight",
                children: [
                    "Pocket",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-primary",
                        children: "Pilot"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                        lineNumber: 102,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                lineNumber: 101,
                columnNumber: 9
            }, this),
            compact && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-base font-semibold tracking-tight",
                children: [
                    "Pocket",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$2$2e$9_$40$babel$2b$core$40$7$2e$29$2e$7_$40$opentelemetry$2b$api$40$1$2e$9$2e$1_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-primary",
                        children: "Pilot"
                    }, void 0, false, {
                        fileName: "[project]/apps/web/src/components/app-shell.tsx",
                        lineNumber: 107,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/apps/web/src/components/app-shell.tsx",
                lineNumber: 106,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/apps/web/src/components/app-shell.tsx",
        lineNumber: 96,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_0__zyz4._.js.map