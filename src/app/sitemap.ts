import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
    { path: "/", changeFrequency: "weekly", priority: 1 },
    { path: "/book", changeFrequency: "weekly", priority: 0.9 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.4 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.4 },
    { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
    { path: "/refunds", changeFrequency: "yearly", priority: 0.4 },
    { path: "/blog", changeFrequency: "monthly", priority: 0.5 },
    { path: "/login", changeFrequency: "yearly", priority: 0.2 },
  ];

  return paths.map((entry) => ({
    url: `${base}${entry.path === "/" ? "" : entry.path}`,
    lastModified: new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
