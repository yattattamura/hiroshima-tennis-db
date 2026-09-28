const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export type TournamentDateInfo = {
  monthDay: string;
  weekday: string;
};

function parseStartDate(startDate?: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const value = startDate?.slice(0, 10) ?? "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));

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

export function getTournamentDateInfo(
  dateText: string,
  startDate?: string
): TournamentDateInfo {
  const parsedStartDate = parseStartDate(startDate);

  if (parsedStartDate) {
    const date = new Date(
      Date.UTC(
        parsedStartDate.year,
        parsedStartDate.month - 1,
        parsedStartDate.day
      )
    );

    return {
      monthDay:
        parsedStartDate.month + "/" + parsedStartDate.day,
      weekday: WEEKDAYS[date.getUTCDay()],
    };
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
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (!Number.isNaN(date.getTime())) {
      return {
        monthDay: month + "/" + day,
        weekday: WEEKDAYS[date.getUTCDay()],
      };
    }
  }

  if (monthDayMatch) {
    const currentYear = new Date().getUTCFullYear();
    const month = Number(monthDayMatch[1]);
    const day = Number(monthDayMatch[2]);
    const date = new Date(
      Date.UTC(currentYear, month - 1, day)
    );

    if (!Number.isNaN(date.getTime())) {
      return {
        monthDay: month + "/" + day,
        weekday: WEEKDAYS[date.getUTCDay()],
      };
    }
  }

  return {
    monthDay: dateText,
    weekday: "",
  };
}
