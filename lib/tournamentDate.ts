import type { TournamentDate } from "@/types/tournament";\n\nconst WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export type TournamentDateInfo = {
  monthDay: string;
  weekday: string;
};

function validateDate(
  year: number,
  month: number,
  day: number
): { year: number; month: number; day: number } | null {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function parseStartDate(startDate?: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const value = startDate?.slice(0, 10) ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  return validateDate(
    Number(value.slice(0, 4)),
    Number(value.slice(5, 7)),
    Number(value.slice(8, 10))
  );
}

function createDateInfo(
  year: number,
  month: number,
  day: number
): TournamentDateInfo | null {
  const validDate = validateDate(year, month, day);

  if (!validDate) {
    return null;
  }

  const date = new Date(
    Date.UTC(
      validDate.year,
      validDate.month - 1,
      validDate.day
    )
  );

  return {
    monthDay:
      validDate.month + "/" + validDate.day,
    weekday: WEEKDAYS[date.getUTCDay()],
  };
}

export function getTournamentDateInfo(
  dateText: string,
  startDate?: string
): TournamentDateInfo {
  const parsedStartDate = parseStartDate(startDate);

  if (parsedStartDate) {
    return createDateInfo(
      parsedStartDate.year,
      parsedStartDate.month,
      parsedStartDate.day
    )!;
  }

  const japaneseMatch = dateText.match(
    /(\d{4})年(\d{1,2})月(\d{1,2})日/
  );
  const slashFullMatch = dateText.match(
    /(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/
  );
  const monthDayMatch = dateText.match(
    /(\d{1,2})[\/-月](\d{1,2})/
  );

  const match = japaneseMatch ?? slashFullMatch;

  if (match) {
    const info = createDateInfo(
      Number(match[1]),
      Number(match[2]),
      Number(match[3])
    );

    if (info) {
      return info;
    }
  }

  if (monthDayMatch) {
    const currentYear = new Date().getUTCFullYear();
    const info = createDateInfo(
      currentYear,
      Number(monthDayMatch[1]),
      Number(monthDayMatch[2])
    );

    if (info) {
      return info;
    }
  }

  return {
    monthDay: dateText,
    weekday: "",
  };
}


import type { TournamentDate } from "@/types/tournament";

function formatIsoDate(value: string, includeWeekday = true): string {
  const parsed = parseStartDate(value);
  if (!parsed) return value;

  const info = createDateInfo(parsed.year, parsed.month, parsed.day);
  if (!info) return value;

  return includeWeekday && info.weekday
    ? `${info.monthDay}（${info.weekday}）`
    : info.monthDay;
}

function formatScheduleItem(item: TournamentDate): string {
  const start = formatIsoDate(item.startDate);
  const end = item.endDate ? parseStartDate(item.endDate) : null;

  if (!end || item.endDate === item.startDate) {
    return start;
  }

  return `${start}～${formatIsoDate(item.endDate)}`;
}

function sortScheduleDates(
  dates: TournamentDate[]
): TournamentDate[] {
  return [...dates].sort((a, b) => {
    const sortOrder = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (sortOrder !== 0) return sortOrder;
    return a.startDate.localeCompare(b.startDate);
  });
}

export type TournamentScheduleInfo = {
  primary: TournamentDateInfo;
  displayText: string;
  reserveText: string;
  hasDetails: boolean;
};

export function getTournamentScheduleInfo(
  dateText: string,
  startDate?: string,
  dates?: TournamentDate[]
): TournamentScheduleInfo {
  const structuredDates = sortScheduleDates(
    (dates ?? []).filter((date) => Boolean(date.startDate))
  );

  if (structuredDates.length === 0) {
    const primary = getTournamentDateInfo(dateText, startDate);
    return {
      primary,
      displayText: dateText?.trim() || primary.monthDay,
      reserveText: "",
      hasDetails: false,
    };
  }

  const regularDates = structuredDates.filter(
    (date) => date.dateType !== "予備日"
  );
  const reserveDates = structuredDates.filter(
    (date) => date.dateType === "予備日"
  );
  const primaryDate = regularDates[0] ?? structuredDates[0];
  const primary = getTournamentDateInfo(
    formatIsoDate(primaryDate.startDate, false),
    primaryDate.startDate
  );

  const formatList = (items: TournamentDate[]) =>
    items.map(formatScheduleItem).join("・");

  const displayText = regularDates.length
    ? formatList(regularDates)
    : "日程未設定";
  const reserveText = reserveDates.length
    ? formatList(reserveDates)
    : "";

  return {
    primary,
    displayText,
    reserveText,
    hasDetails:
      regularDates.length > 1 ||
      regularDates.some(
        (date) => date.endDate && date.endDate !== date.startDate
      ) ||
      reserveDates.length > 0,
  };
}
