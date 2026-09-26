import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<
  MetadataRoute.Sitemap
> {
  const supabase =
    await createClient();

  const {
    data: tournaments,
  } = await supabase
    .from("tournaments")
    .select(
      "id, updated_at"
    )
    .order("id", {
      ascending: true,
    });

  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${SITE_URL}/tournaments`,
      changeFrequency: "daily",
      priority: 0.9,
    },

    {
      url: `${SITE_URL}/areas`,
      changeFrequency: "weekly",
      priority: 0.7,
    },

    {
      url: `${SITE_URL}/organizers`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  for (
    const tournament of tournaments ?? []
  ) {
    entries.push({
      url:
        `${SITE_URL}/tournaments/${tournament.id}`,

      lastModified:
        tournament.updated_at
          ? new Date(
              tournament.updated_at
            )
          : undefined,

      changeFrequency: "weekly",

      priority: 0.7,
    });
  }

  return entries;
}