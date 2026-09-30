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
    .replace(/[０-９]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    )
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

  // Japanese tournament sites use several equivalent labels.
  const keyword =
    /(?:申込期日|申込期限|申込締切|申し込み締切|申し込み期限|エントリー締切|エントリー期限|受付締切|受付期限|締切|締め切り|期限|〆切)/gi;

  const matches = Array.from(text.matchAll(keyword));

  for (const match of matches) {
    const index = match.index ?? -1;
    if (index < 0) continue;

    const excerpt = text.slice(Math.max(0, index - 80), index + 180);
    const dateMatches = Array.from(
      excerpt.matchAll(
        /(?:(?:20\d{2})年?\s*)?\d{1,2}(?:月|[./-])\d{1,2}日?/g
      )
    );

    const candidates = dateMatches
      .map((dateMatch) => {
        const date = parseDate(dateMatch[0], fallbackYear);
        if (!date) return null;

        const absoluteIndex = Math.max(0, index - 80) + (dateMatch.index ?? 0);
        return {
          date,
          raw: dateMatch[0],
          distance: Math.abs(absoluteIndex - index),
          isAfterKeyword: absoluteIndex >= index,
        };
      })
      .filter(
        (candidate): candidate is {
          date: string;
          raw: string;
          distance: number;
          isAfterKeyword: boolean;
        } => Boolean(candidate)
      )
      .filter((candidate) => !eventStartDate || candidate.date <= eventStartDate)
      .sort((a, b) => {
        // In tables such as "申込期日 | 3/4", prefer the date immediately
        // after the keyword. Otherwise choose the nearest date.
        if (a.isAfterKeyword !== b.isAfterKeyword) {
          return a.isAfterKeyword ? -1 : 1;
        }
        return a.distance - b.distance;
      });

    const candidate = candidates[0];
    if (!candidate) continue;

    const confidence = /20\d{2}/.test(candidate.raw)
      ? 96
      : 92;

    return {
      date: candidate.date,
      text: candidate.raw,
      excerpt,
      confidence,
    };
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
    // Some tournament sites reject server-side crawlers with HTTP 403 even
    // though the same page is publicly accessible in a normal browser.
    // Try the crawler identity first, then retry once with browser-like
    // navigation headers. Keep the retry bounded by the same timeout.
    const crawlerHeaders = {
      "User-Agent":
        "KnowNisDeadlineBot/1.0 (+https://hiroshima-tennis-db-xzcj-delta.vercel.app)",
      Accept: "text/html,application/xhtml+xml,application/pdf",
    };

    const browserHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
    };

    let response = await fetch(url, {
      signal: controller.signal,
      headers: crawlerHeaders,
      cache: "no-store",
    });

    if (response.status === 403) {
      await response.body?.cancel();

      response = await fetch(url, {
        signal: controller.signal,
        headers: browserHeaders,
        cache: "no-store",
      });
    }

    if (!response.ok) {
      const detail =
        response.status === 403
          ? "HTTP 403（ブラウザ偽装でもアクセス拒否）"
          : `HTTP ${response.status}`;
      throw new Error(detail);
    }

    const contentType = response.headers.get("content-type") ?? "";

    // PDF parsing is intentionally not attempted yet. Treating a PDF as HTML
    // produces unreliable results, so leave it for the dedicated PDF phase.
    if (contentType.includes("application/pdf") || url.toLowerCase().includes(".pdf")) {
      return {
        date: null,
        text: null,
        excerpt: "PDF形式の公式資料です。PDF自動解析は次の対応フェーズで追加します。",
        confidence: 0,
      };
    }

    const html = await response.text();
    return detectDeadline(html, fallbackYear, eventStartDate);
  } finally {
    clearTimeout(timer);
  }
}
