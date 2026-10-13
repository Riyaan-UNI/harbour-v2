/* Counter Card: a one-screen card the student can show to a staff member.
   The payload travels in the URL fragment, so the server stores nothing. */

import { asEnum, asString, asStringArray } from "../lib/validate.js";
import { store } from "../lib/store.js";
import { getGlossary } from "./rentalService.js";
import { llmJson } from "./llmRouter.js";
import { translateToStaffLanguage } from "./adapters/translateAdapter.js";

export const SCENARIOS = {
  immigration: {
    label: "Immigration / visa",
    zhTitle: "簽證查詢",
    zhLines: ["你好，我想查詢我的學生簽證申請。", "這是我的身份證及申請文件。", "請問我還需要補交甚麼文件？", "麻煩你，謝謝。"],
    enTitle: "Visa enquiry",
    enLines: ["Hello, I would like to ask about my student visa application.", "Here are my identity document and application papers.", "Could you tell me whether any document is still missing?", "Thank you for your help."],
  },
  clinic: {
    label: "Clinic / hospital",
    zhTitle: "診所登記",
    zhLines: ["你好，我不舒服，想預約今日或明日的診症。", "這是我正在服用的藥物清單。", "我有以下藥物敏感。", "謝謝你的幫忙。"],
    enTitle: "Clinic appointment",
    enLines: ["Hello, I am unwell and would like an appointment today or tomorrow.", "Here is the list of medicine I am taking.", "I have the allergies listed below.", "Thank you for your help."],
  },
  bank: {
    label: "Bank",
    zhTitle: "銀行服務",
    zhLines: ["你好，我想辦理銀行戶口手續。", "我有學生簽證、身份證及住址證明。", "請問還需要甚麼文件？", "謝謝。"],
    enTitle: "Bank service",
    enLines: ["Hello, I would like help with my bank account.", "I have my student visa, identity card and proof of address.", "Which other documents do you need?", "Thank you."],
  },
  district_office: {
    label: "District office",
    zhTitle: "民政事務處",
    zhLines: ["你好，我需要辦理住址證明或聲明。", "這是我的身份證及租約。", "請問需要預約嗎？", "謝謝你的協助。"],
    enTitle: "District office",
    enLines: ["Hello, I need a proof of address or a declaration.", "Here are my identity card and tenancy agreement.", "Do I need an appointment?", "Thank you for your help."],
  },
  landlord: {
    label: "Landlord / agent",
    zhTitle: "單位維修",
    zhLines: ["你好，單位有以下問題需要維修。", "我已附上照片作參考。", "請問甚麼時候可以安排維修？", "謝謝。"],
    enTitle: "Repair request",
    enLines: ["Hello, the flat needs repairs for the problems listed below.", "I have attached photos for reference.", "When could the repair be arranged?", "Thank you."],
  },
  other: {
    label: "Something else",
    zhTitle: "一般查詢",
    zhLines: ["你好，我需要協助。", "詳情如下。", "請問你能否幫忙，或轉介我到正確的部門？", "謝謝。"],
    enTitle: "General enquiry",
    enLines: ["Hello, I need some help.", "The details are below.", "Could you help me, or tell me the right counter?", "Thank you."],
  },
};

export const SCENARIO_KEYS = Object.keys(SCENARIOS);

function base64url(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function cannedCards(scenario, need, documents, userLang) {
  const preset = SCENARIOS[scenario];
  const zhLines = [...preset.zhLines];
  const enLines = [...preset.enLines];

  if (documents.length) {
    zhLines.splice(2, 0, `我有以下文件：${documents.join("、")}。`);
    enLines.splice(2, 0, `I have these documents: ${documents.join(", ")}.`);
  }
  if (need) {
    zhLines.push(`（學生的說明）${need}`);
    enLines.push(`(Student's note) ${need}`);
  }

  const studentLines = String(userLang || "en").toLowerCase().startsWith("zh") ? zhLines : enLines;

  return {
    staffCard: { title: preset.zhTitle, lines: zhLines, lang: "zh-Hant" },
    studentCard: { title: String(userLang || "en").toLowerCase().startsWith("zh") ? preset.zhTitle : preset.enTitle, lines: studentLines, lang: userLang || "en" },
  };
}

function cardIsValid(value) {
  return Boolean(value?.staffCard?.lines?.length) && Boolean(value?.studentCard?.lines?.length);
}

export async function buildCounterCard(body = {}) {
  const scenario = asEnum(body.scenario, SCENARIO_KEYS, "other");
  const need = asString(body.need, { max: 500, field: "what you need" });
  const userLang = asString(body.userLang, { max: 24, field: "your language" }) || "en";
  const documents = asStringArray(body.documents, { max: 12, each: 60 });

  let cards = cannedCards(scenario, need, documents, userLang);

  const model = await llmJson("counter-card", {
    SCENARIO: SCENARIOS[scenario].label,
    NEED: need || "(not specified)",
    DOCUMENTS: documents.length ? documents.join(", ") : "(none listed)",
    USER_LANG: userLang,
  }, cardIsValid);

  if (model) {
    cards = {
      staffCard: {
        title: asString(model.staffCard.title, { max: 60 }) || SCENARIOS[scenario].zhTitle,
        lines: asStringArray(model.staffCard.lines, { max: 6, each: 120 }),
        lang: "zh-Hant",
      },
      studentCard: {
        title: asString(model.studentCard.title, { max: 60 }) || SCENARIOS[scenario].enTitle,
        lines: asStringArray(model.studentCard.lines, { max: 6, each: 120 }),
        lang: userLang,
      },
    };
    if (!cards.staffCard.lines.length) cards.staffCard.lines = cannedCards(scenario, need, documents, userLang).staffCard.lines;
    if (!cards.studentCard.lines.length) cards.studentCard.lines = cannedCards(scenario, need, documents, userLang).studentCard.lines;
  } else {
    // Without a model, fall back to the existing translator when it can help.
    const translated = await translateToStaffLanguage(`${need}`, userLang);
    if (translated && !userLang.toLowerCase().startsWith("zh")) {
      cards.staffCard.lines = [...cards.staffCard.lines, `（學生的說明）${translated}`];
    }
  }

  const glossary = await getGlossary();
  // Glossary keys are data, not patterns. Building a RegExp straight from them
  // would throw or mis-match the moment a key contains a metacharacter.
  const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const haystack = `${need} ${documents.join(" ")}`;
  const glossaryHits = Object.entries(glossary)
    .filter(([term]) => new RegExp(escapeRegExp(term), "i").test(haystack))
    .slice(0, 6)
    .map(([term, zh]) => ({ term, zh }));

  store.increment("counterCards");

  return {
    ...cards,
    glossary: glossaryHits,
    fragmentPayload: base64url({ s: scenario, n: need, d: documents, l: userLang }),
  };
}
