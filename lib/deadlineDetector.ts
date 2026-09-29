export type DeadlineDetection = {
  date: string | null;
  text: string | null;
  excerpt: string | null;
  confidence: number;
};

function normalizeText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

function toIsoDate(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(value: string, fallbackYear: number): string | null {
  const normalized = value
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, "");

  const match = normalized.match(
    /(?:(20\d{2})年?)?(\d{1,2})(?:月|[./-])(\d{1,2})日?/
  );
  if (!match) return null;

  const year = Number(match[1] ?? fallbackYear);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return toIsoDate(year, month, day);
}

export function detectDeadline(
  html: string,
  fallbackYear: number,
  eventStartDate?: string | null
): DeadlineDetection {
  const text = normalizeText(html);
  const keyword =
    /(?:申込|申し込み|受付|募集|エントリー)?(?:締切|締め切り|期限|〆切)/i;

  const matches = Array.from(text.matchAll(keyword));
  for (const match of matches) {
    const index = match.index ?? -1;
    if (index < 0) continue;

    const excerpt = text.slice(Math.max(0, index - 30), index + 140);
    const dateMatches = Array.from(
      excerpt.matchAll(
        /(?:(?:20\d{2})年?\s*)?\d{1,2}(?:月|[./-])\d{1,2}日?/g
      )
    );

    for (const dateMatch of dateMatches) {
      const raw = dateMatch[0];
      const date = parseDate(raw, fallbackYear);
      if (!date) continue;

      if (eventStartDate && date > eventStartDate) continue;

      const confidence = /20\d{2}/.test(raw)
        ? 96
        : /(?:申込|受付|募集|エントリー)/.test(match[0])
          ? 90
          : 82;

      return {
        date,
        text: raw,
        excerpt,
        confidence,
      };
    }
  }

  return {
    date: null,
    text: null,
    excerpt: null,
    confidence: 0,
  };
}

export async function fetchAndDetectDeadline(
  url: string,
  fallbackYear: number,
  eventStartDate?: string | null
): Promise<DeadlineDetection> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "KnowNisDeadlineBot/1.0 (+https://hiroshima-tennis-db-xzcj-delta.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    return detectDeadline(html, fallbackYear, eventStartDate);
  } finally {
    clearTimeout(timer);
  }
}
