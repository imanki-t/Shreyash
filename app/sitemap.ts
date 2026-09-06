import { MetadataRoute } from "next";
import { DEFAULT_DOCKETS } from "@/lib/defaultDockets";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://departmentofjustice.onrender.com";

  const docketEntries = DEFAULT_DOCKETS.map((docket) => ({
    url: `${baseUrl}/archive/${docket.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/upload`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    ...docketEntries,
  ];
}
