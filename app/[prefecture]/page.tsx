import { notFound } from "next/navigation";

import TournamentsPage from "@/app/tournaments/page";
import { getPrefectureBySlug } from "@/lib/prefectures";

export default async function PrefecturePage({
  params,
  searchParams,
}: {
  params: Promise<{ prefecture: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { prefecture: slug } = await params;
  const prefecture = getPrefectureBySlug(slug);

  if (!prefecture) {
    notFound();
  }

  return (
    <TournamentsPage
      searchParams={searchParams}
      routePrefecture={prefecture.name}
      basePath={`/${prefecture.slug}`}
    />
  );
}
