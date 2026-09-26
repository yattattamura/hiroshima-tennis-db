import type { Metadata } from "next";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Tournament = {
  id: string;
  name: string;
  organizer_name_raw: string | null;
  venue_name_raw: string | null;
  city: string | null;
  date_text: string | null;
  start_date: string | null;
  end_date: string | null;
  event_type: string | null;
  gender: string | null;
  level: string | null;
  eligibility: string | null;
  fee_text: string | null;
  deadline_text: string | null;
  application_method: string | null;
  official_url: string | null;
  status: string | null;
  notes: string | null;
};

const getTournament = cache(
  async (
    id: string
  ): Promise<Tournament | null> => {
    const supabase =
      await createClient();

    const {
      data,
      error,
    } = await supabase
      .from("tournaments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Tournament;
  }
);

function buildDescription(
  tournament: Tournament
): string {
  const parts: string[] = [];

  if (tournament.date_text) {
    parts.push(
      `開催日：${tournament.date_text}`
    );
  }

  if (
    tournament.city ||
    tournament.venue_name_raw
  ) {
    const venue = [
      tournament.city,
      tournament.venue_name_raw,
    ]
      .filter(Boolean)
      .join("・");

    parts.push(
      `会場：${venue}`
    );
  }

  if (tournament.event_type) {
    parts.push(
      `種目：${tournament.event_type}`
    );
  }

  if (tournament.level) {
    parts.push(
      `クラス：${tournament.level}`
    );
  }

  if (tournament.fee_text) {
    parts.push(
      `参加費：${tournament.fee_text}`
    );
  }

  if (tournament.deadline_text) {
    parts.push(
      `申込締切：${tournament.deadline_text}`
    );
  }

  const base =
    parts.length > 0
      ? parts.join("。")
      : "広島県のテニス大会情報を掲載しています。";

  return `${base} 広島テニスDBで大会情報・参加資格・情報源を確認できます。`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}): Promise<Metadata> {
  const { id } = await params;

  const tournament =
    await getTournament(id);

  if (!tournament) {
    return {
      title:
        "大会情報が見つかりません",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title =
    `${tournament.name} | ${SITE_NAME}`;

  const description =
    buildDescription(tournament);

  const canonical =
    `${SITE_URL}/tournaments/${tournament.id}`;

  return {
    title,

    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: SITE_NAME,
      locale: "ja_JP",
    },

    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function TournamentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const tournament =
    await getTournament(id);

  if (!tournament) {
    return children;
  }

  const pageUrl =
    `${SITE_URL}/tournaments/${tournament.id}`;

  const locationName = [
    tournament.city,
    tournament.venue_name_raw,
  ]
    .filter(Boolean)
    .join("・");

  const eventData: Record<
    string,
    unknown
  > = {
    "@context":
      "https://schema.org",

    "@type": "Event",

    name: tournament.name,

    url: pageUrl,

    description:
      buildDescription(tournament),
  };

  if (tournament.start_date) {
    eventData.startDate =
      tournament.start_date;
  }

  if (tournament.end_date) {
    eventData.endDate =
      tournament.end_date;
  }

  if (locationName) {
    eventData.location = {
      "@type": "Place",
      name: locationName,
      address: {
        "@type": "PostalAddress",
        addressLocality:
          tournament.city ?? undefined,
        addressCountry: "JP",
      },
    };
  }

  if (tournament.organizer_name_raw) {
    eventData.organizer = {
      "@type": "Organization",
      name:
        tournament.organizer_name_raw,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            eventData
          ).replace(
            /</g,
            "\\u003c"
          ),
        }}
      />

      {children}
    </>
  );
}