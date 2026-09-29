export function resolveTournamentCity(city?: string | null, venue?: string | null): string {
  const normalizedCity = city?.trim() ?? "";

  if (normalizedCity) {
    return normalizedCity;
  }

  const normalizedVenue = venue?.trim() ?? "";

  const venueCityMap: Record<string, string> = {
    郷原: "呉市",
    広域: "広島市",
    翔洋: "広島市",
  };

  return venueCityMap[normalizedVenue] ?? "";
}

export function formatTournamentVenue(
  city?: string | null,
  venue?: string | null
): string {
  const resolvedCity = resolveTournamentCity(city, venue);
  const normalizedVenue = venue?.trim() ?? "";

  if (resolvedCity && normalizedVenue) {
    return `${resolvedCity}・${normalizedVenue}`;
  }

  return resolvedCity || normalizedVenue || "未設定";
}
