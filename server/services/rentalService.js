/* Deterministic-first rental checks. Rules and templates handle what they can;
   the model is only asked to extract fields or summarise clauses. */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { cached, cacheKey } from "../lib/cache.js";
import { flags } from "../lib/flags.js";
import { store } from "../lib/store.js";
import { asBoolean, asNumber, asString, badInput } from "../lib/validate.js";
import { llmJson } from "./llmRouter.js";
import { lookupLicence } from "./adapters/licenceAdapter.js";
import { lookupOwner } from "./adapters/landAdapter.js";

const dataDir = fileURLToPath(new URL("../data/", import.meta.url));

export const VERIFY_LINKS = {
  licence: { label: "Check the estate agent licence list (EAA)", url: "https://www.eaa.org.hk/en-us/Information-Centre/Licence-Search" },
  land: { label: "Run an official land search", url: "https://www.gov.hk/en/residents/housing/land/" },
  rvd: { label: "Rating and Valuation Department", url: "https://www.rvd.gov.hk/en/" },
  scam: { label: "Police Anti-Scam Helpline 18222", url: "tel:18222" },
};

export const LISTING_DISCLAIMER = "General information only, not legal advice. A green result does not mean the listing is safe — it only means the patterns Harbour checks were not found. Always verify the agent's licence, run a land search, and talk to someone you trust before paying.";

export const LEASE_DISCLAIMER = "General information only, not legal advice. For a tenancy dispute, contact the Rating and Valuation Department hotline or the Duty Lawyer Service.";

const URGENCY_PATTERNS = [
  /today only/i, /act now/i, /limited time/i, /urgent/i, /immediately/i,
  /others? (are )?waiting/i, /before someone else/i, /first come/i,
  /今日內/, /最後機會/, /盡快/,
];
const REFUSES_ID_PATTERNS = [
  /won'?t (give|share|provide|show) (my |the |his |her )?(name|id|licence)/i,
  /don'?t (need|have) (a )?(licence|id)/i,
  /no need (for|to) (my )?(id|licence)/i,
  /refuse[sd]? to (give|show|provide)/i,
  /不方便提供/, /唔需要牌照/,
];
const NO_RECEIPT_PATTERNS = [/no receipt/i, /cash only/i, /without (a )?receipt/i, /不設收據/, /現金/];
const SUBLET_PATTERNS = [/sub-?let/i, /share (the )?flat/i, /分租/, /二房東/];

function matchesAny(text, patterns) {
  return patterns.some(pattern => pattern.test(text));
}

export const CLAUSE_RULES = [
  { type: "TERM", re: /\b(term of|tenancy period|lease period|租期)\b/i, risk: "low", summary: "How long the tenancy runs, and its start and end dates.", why: "A clear term tells you exactly when you must move out." },
  { type: "BREAK_CLAUSE", re: /break clause|early termination|中斷條款/i, risk: "medium", summary: "How either side can end the tenancy before the term ends.", why: "Check the notice period and any penalty before you sign." },
  { type: "DEPOSIT", re: /\bdeposit\b|按金/i, risk: "medium", summary: "How much deposit is held and the conditions for returning it.", why: "Deposits cause the most disputes. Get the return conditions in writing." },
  { type: "ADVANCE_RENT", re: /advance rent|rent in advance|prepaid rent|預繳租金/i, risk: "high", summary: "Rent paid before you move in.", why: "Many months up front is a common scam pattern. Three months is the usual maximum." },
  { type: "AGENCY_COMMISSION", re: /commission|agency fee|agent'?s fee|佣金/i, risk: "medium", summary: "The agent's fee and when it becomes payable.", why: "Half a month's rent for a one-year lease is the usual rate." },
  { type: "SUBLET", re: /sub-?let|分租|二房東/i, risk: "high", summary: "Whether you are renting from the owner or from a sub-tenant.", why: "If the person is not the owner, your rights are weaker. Verify with a land search." },
  { type: "STAMP_DUTY", re: /stamp duty|印花稅/i, risk: "medium", summary: "Who arranges and pays stamp duty.", why: "A stamped agreement is strong evidence if there is a dispute." },
  { type: "FEES_AND_UTILITIES", re: /management fee|utilities|water|electricity|gas bill|管理費|水電/i, risk: "medium", summary: "Which bills are included and which are extra.", why: "Unclear utilities are a common surprise cost." },
  { type: "REPAIRS", re: /repair|maintenance|維修/i, risk: "medium", summary: "Who fixes what, and how quickly.", why: "A written response time stops repairs from dragging on." },
  { type: "LANDLORD_ENTRY", re: /landlord.{0,24}(enter|access)|right of entry|進入|檢查單位/i, risk: "high", summary: "When the landlord may enter the flat.", why: "Entry should need notice and your agreement, except in an emergency." },
  { type: "TERMINATION_NOTICE", re: /notice period|termination notice|通知期/i, risk: "medium", summary: "How much notice each side must give to end the tenancy.", why: "A long notice period can lock you in. Check it against your course dates." },
  { type: "INVENTORY", re: /inventory|check-?in|condition report|物品清單/i, risk: "low", summary: "The record of the flat's condition when you move in.", why: "Photos and a signed inventory protect your deposit." },
];

export const ALL_CLAUSE_TYPES = CLAUSE_RULES.map(rule => rule.type);

function nextStepsFor(flagsFound) {
  const steps = [];
  const has = id => flagsFound.some(flag => flag.id === id);
  if (has("PAY_BEFORE_VIEWING") || has("PAY_BEFORE_SIGNING") || has("LUMP_SUM_RENT")) steps.push("Do not send any more money until you have seen the flat and the paperwork.");
  if (has("NO_LICENCE_NO") || has("AGENT_REFUSES_ID")) steps.push("Ask for the estate agent's licence number, then check it on the EAA licence list yourself.");
  if (has("LANDLORD_NAME_MISMATCH")) steps.push("Do not pay a deposit until an official land search confirms who owns the flat.");
  if (has("URGENCY_PRESSURE")) steps.push("Treat time pressure as a warning sign. A genuine landlord will still be there tomorrow.");
  if (has("SUBLET_UNCLEAR")) steps.push("Ask in writing whether you are renting from the owner or from a sub-tenant.");
  if (has("NO_RECEIPT_PLAN")) steps.push("Ask for a written receipt and a stamped tenancy agreement for every payment.");
  steps.push("Speak to your university's student affairs office before you sign anything.");
  steps.push("If you have already paid, work through the first-hour playbook on this page.");
  return steps.slice(0, 6);
}

function scoreFlags(flagsFound) {
  if (flagsFound.some(flag => flag.severity === "red")) return "red";
  if (flagsFound.filter(flag => flag.severity === "amber").length >= 2) return "amber";
  return "green";
}

function ruleExtraction(text) {
  const monthsMatch = text.match(/(\d{1,2})\s*(?:months?|個月)/i);
  return {
    agentName: "",
    licenceNo: (text.match(/\bE-\d{6}\b/i) || [""])[0],
    landlordName: "",
    amountMonths: monthsMatch ? Number(monthsMatch[1]) : 0,
    beforeViewing: /before (you )?(see|view|visit)|prior to viewing|未睇樓/i.test(text),
    beforeSigning: /before (you )?sign|prior to signing|簽約前/i.test(text),
    urgencyPhrases: URGENCY_PATTERNS.filter(pattern => pattern.test(text)).map(pattern => pattern.source),
  };
}

function extractionIsValid(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function checkListing(body = {}) {
  const listingText = asString(body.listingText, { max: 5000, field: "the listing text" });
  const agentName = asString(body.agentName, { max: 120, field: "the agent name" });
  const licenceNo = asString(body.licenceNo, { max: 40, field: "the licence number" });
  const landlordName = asString(body.landlordName, { max: 120, field: "the landlord name" });
  const payment = body.payment && typeof body.payment === "object" ? body.payment : {};
  const amountMonths = asNumber(payment.amountMonths, { min: 0, max: 60, fallback: 0 });
  const beforeViewing = asBoolean(payment.beforeViewing);
  const beforeSigning = asBoolean(payment.beforeSigning);

  if (!listingText && !agentName && !licenceNo && !landlordName && !amountMonths && !beforeViewing && !beforeSigning) {
    throw badInput("Add the listing text or at least one detail about the agent or payment.");
  }

  const key = cacheKey(JSON.stringify({ listingText, agentName, licenceNo, landlordName, amountMonths, beforeViewing, beforeSigning }));
  return cached(key, async () => {
    const rules = ruleExtraction(listingText);
    let extracted = rules;

    // The model only fills gaps the rules could not read. Mock mode skips it entirely.
    if (listingText && (!rules.licenceNo || !rules.amountMonths)) {
      const model = await llmJson("listing-extract", { INPUT: listingText }, extractionIsValid);
      if (model) {
        extracted = {
          agentName: asString(model.agentName, { max: 120 }),
          licenceNo: asString(model.licenceNo, { max: 40 }),
          landlordName: asString(model.landlordName, { max: 120 }),
          amountMonths: asNumber(model.amountMonths, { min: 0, max: 60, fallback: 0 }),
          beforeViewing: asBoolean(model.beforeViewing),
          beforeSigning: asBoolean(model.beforeSigning),
          urgencyPhrases: Array.isArray(model.urgencyPhrases) ? model.urgencyPhrases.slice(0, 6).map(String) : [],
        };
      }
    }

    // User-supplied answers always win over anything inferred.
    const resolved = {
      agentName: agentName || extracted.agentName,
      licenceNo: licenceNo || extracted.licenceNo,
      landlordName: landlordName || extracted.landlordName,
      amountMonths: amountMonths || extracted.amountMonths,
      beforeViewing: beforeViewing || extracted.beforeViewing,
      beforeSigning: beforeSigning || extracted.beforeSigning,
    };

    const licence = resolved.agentName || resolved.licenceNo
      ? await lookupLicence({ agentName: resolved.agentName, licenceNo: resolved.licenceNo })
      : null;
    const land = resolved.landlordName ? await lookupOwner({ landlordName: resolved.landlordName }) : null;

    const found = [];
    if (resolved.beforeViewing) {
      found.push({ id: "PAY_BEFORE_VIEWING", severity: "red", why: "Money was requested before you have seen the flat. A genuine landlord asks for a deposit only after a viewing and after you have read the agreement.", verify: VERIFY_LINKS.scam });
    }
    if (resolved.agentName && !resolved.licenceNo) {
      found.push({ id: "NO_LICENCE_NO", severity: "red", why: "An estate agent was named but no licence number was given. Licensed agents must be able to show one.", verify: VERIFY_LINKS.licence });
    }
    if (listingText && matchesAny(listingText, REFUSES_ID_PATTERNS)) {
      found.push({ id: "AGENT_REFUSES_ID", severity: "red", why: "The message suggests the agent will not give a name or licence number. That is not how a licensed agent behaves.", verify: VERIFY_LINKS.licence });
    }
    if (resolved.amountMonths > 3) {
      found.push({ id: "LUMP_SUM_RENT", severity: "red", why: `${resolved.amountMonths} months of rent up front is well above the usual practice in Hong Kong, and is a common pattern in rental scams.`, verify: VERIFY_LINKS.rvd });
    }
    if (land?.found && resolved.landlordName && land.owner && land.owner.toLowerCase() !== resolved.landlordName.toLowerCase()) {
      found.push({ id: "LANDLORD_NAME_MISMATCH", severity: "red", why: `The name on the land record does not match the person asking you to pay.`, verify: VERIFY_LINKS.land });
    }
    if (resolved.beforeSigning) {
      found.push({ id: "PAY_BEFORE_SIGNING", severity: "amber", why: "Money was requested before the tenancy agreement is signed. Ask to read the agreement first.", verify: VERIFY_LINKS.rvd });
    }
    if (listingText && matchesAny(listingText, URGENCY_PATTERNS)) {
      found.push({ id: "URGENCY_PRESSURE", severity: "amber", why: "The message pushes you to decide quickly. Time pressure is a manipulation tactic, not a normal rental process.", verify: VERIFY_LINKS.scam });
    }
    if (!resolved.landlordName || (listingText && matchesAny(listingText, SUBLET_PATTERNS))) {
      found.push({ id: "SUBLET_UNCLEAR", severity: "amber", why: "It is not clear whether you would be renting from the owner or from a sub-tenant. Your rights are different in each case.", verify: VERIFY_LINKS.land });
    }
    if (!listingText || !/receipt|stamp|收據|印花/i.test(listingText)) {
      found.push({ id: "NO_RECEIPT_PLAN", severity: "info", why: "Nothing mentions a receipt or a stamped agreement. Ask for both — they are your evidence if something goes wrong.", verify: VERIFY_LINKS.rvd });
    }

    const risk = scoreFlags(found);
    store.increment("listingChecks");

    return {
      risk,
      flags: found,
      nextSteps: nextStepsFor(found),
      disclaimer: LISTING_DISCLAIMER,
      resolved: { ...resolved, licence, land },
    };
  }, { ttl: 10 * 60 * 1000 });
}

function extractClauses(text) {
  const clauses = [];
  for (const rule of CLAUSE_RULES) {
    const match = text.match(rule.re);
    if (!match) continue;
    const index = match.index ?? 0;
    const around = text.slice(Math.max(0, index - 60), Math.min(text.length, index + 220)).replace(/\s+/g, " ").trim();
    clauses.push({
      type: rule.type,
      summary: rule.summary,
      risk: rule.risk,
      why: rule.why,
      excerpt: around,
    });
  }
  return clauses;
}

function leaseIsValid(value) {
  return Boolean(value) && Array.isArray(value.clauses);
}

export async function xrayLease(body = {}) {
  const text = asString(body.text, { max: 20000, field: "the lease text" });
  if (text.length < 40) throw badInput("Paste at least a few lines of the tenancy agreement.");

  const key = cacheKey(`lease:${text}`);
  return cached(key, async () => {
    const rules = extractClauses(text);
    const model = await llmJson("lease-xray", { INPUT: text.slice(0, 18000) }, leaseIsValid);

    let clauses = rules.map(({ excerpt, ...clause }) => clause);
    if (model) {
      clauses = model.clauses
        .filter(clause => clause && typeof clause.type === "string" && typeof clause.summary === "string")
        .slice(0, 12)
        .map(clause => ({
          type: ALL_CLAUSE_TYPES.includes(clause.type) ? clause.type : "TERM",
          summary: asString(clause.summary, { max: 320 }) || "Clause found in your agreement.",
          risk: ["high", "medium", "low"].includes(clause.risk) ? clause.risk : "medium",
          why: asString(clause.why, { max: 240 }) || "Read this clause carefully before signing.",
        }));
    }

    const seen = new Set(clauses.map(clause => clause.type));
    const missing = ALL_CLAUSE_TYPES.filter(type => !seen.has(type));
    const order = { high: 0, medium: 1, low: 2 };
    clauses.sort((a, b) => order[a.risk] - order[b.risk]);

    store.increment("leaseReads");

    return {
      clauses,
      missing,
      disclaimer: LEASE_DISCLAIMER,
      summary: clauses.length
        ? `Harbour read ${clauses.length} clause${clauses.length === 1 ? "" : "s"}. ${clauses.filter(clause => clause.risk === "high").length} need your attention first.`
        : "Harbour could not find standard tenancy clauses in this text. Check that you pasted the agreement itself.",
    };
  }, { ttl: 10 * 60 * 1000 });
}

let playbookCache = null;

export async function getPlaybook() {
  if (playbookCache) return playbookCache;
  playbookCache = JSON.parse(await readFile(path.join(dataDir, "rental-playbook.json"), "utf8"));
  return playbookCache;
}

export async function getGlossary() {
  return JSON.parse(await readFile(path.join(dataDir, "glossary.json"), "utf8"));
}

export function rentalFlags() {
  return { mock: flags().MOCK_AI };
}
