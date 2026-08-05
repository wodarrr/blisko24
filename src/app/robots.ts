import type { MetadataRoute } from "next";

const siteUrl = "https://blisko24.com.pl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/konto",
        "/logowanie",
        "/moj-profil",
        "/moje-dopasowania",
        "/moje-ogloszenia",
        "/powiadomienia",
        "/profil/",
        "/reset-hasla",
        "/ulubione",
        "/ustawienia/",
        "/wiadomosci",
        "/znajdz-kandydata",
        "/dodaj-ogloszenie",
        "/edytuj-ogloszenie/",
        "/promuj-ogloszenie/",
        "/platnosc-testowa/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}