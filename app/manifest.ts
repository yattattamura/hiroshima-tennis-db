import type { MetadataRoute } from "next";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,

    short_name:
      "ノウニス",

    description:
      SITE_DESCRIPTION,

    start_url: "/",

    display: "standalone",

    background_color:
      "#ffffff",

    theme_color:
      "#1769d1",

    lang: "ja",

    icons: [
      {
        src: "/brand/know-nis-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
