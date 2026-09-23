import raw from "@/data/tournaments.json";
import { Tournament } from "@/types/tournament";

export const tournaments = raw as Tournament[];

export function getTournament(id: string) {
  return tournaments.find((t) => t.id === id);
}

export function getCities() {
  return [...new Set(tournaments.map((t) => t.city).filter(Boolean))].sort();
}
