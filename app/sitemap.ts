import type { MetadataRoute } from "next";
import { geoCities, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.domain;
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/models`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/pricing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/tutorials`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${base}/cases`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${base}/help`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${base}/announcements`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75,
    },
  ];

  const geoPages: MetadataRoute.Sitemap = geoCities.map((city) => ({
    url: `${base}/geo/${city.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...pages, ...geoPages];
}
