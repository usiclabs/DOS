import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://dos.deus.finance",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://dos.deus.finance/pools",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: "https://dos.deus.finance/portfolio",
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: "https://dos.deus.finance/analytics",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ]
}
