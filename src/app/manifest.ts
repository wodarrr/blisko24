import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BLISKO24 – Portal lokalnych możliwości",
    short_name: "BLISKO24",
    description:
      "Znajdź pracę, pracownika, fachowca lub lokalną pomoc.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    lang: "pl",
    categories: ["business", "jobs", "social"],
  };
}