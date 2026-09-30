export type TournamentDate = {
  id?: string;
  startDate: string;
  endDate?: string | null;
  dateType: "開催日" | "予備日";
  label?: string | null;
  sortOrder?: number;
};

export type Tournament = {
  id: string;
  name: string;
  organizer: string;
  date: string;
  startDate?: string;
  tournamentDates?: TournamentDate[];
  city: string;
  venue: string;
  eventType: string;
  gender: string;
  level: string;
  eligibility: string;
  fee: string;
  deadline: string;
  deadlineDate?: string;
  applicationMethod: string;
  officialUrl: string;
  status: string;
  notes: string;
  eligibilityCategory: string;
  membershipRequired: string;
  externalAllowed: string;
  otherCityAllowed: string;
  ageCondition: string;
  searchTokens: string;
};
