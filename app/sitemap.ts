import type { MetadataRoute } from "next";
import { GLOSSARY_TERMS } from "@/lib/content/glossary-terms";
import { GUIDES } from "@/lib/content/guides-registry";
import { listDirectoryEntries } from "@/lib/data/platforms";

const BASE = "https://talasanj.org";
const METHODS = [
  "molten-gold",
  "gold-bar",
  "coin",
  "jewelry",
  "gold-fund",
  "commodity-certificate",
  "digital-gold",
];
const TOOLS = [
  "real-cost",
  "method-compare",
  "coin-bubble",
  "savings-plan",
  "ejrat",
  "break-even",
];
const BEST = [
  "lowest-fee",
  "physical-delivery",
  "small-savings",
  "licensed",
  "fastest-settlement",
  "gold-bar",
];

function item(
  path: string,
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >,
  priority: number,
): MetadataRoute.Sitemap[number] {
  return {
    url: BASE + path,
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed: MetadataRoute.Sitemap = [
    item("/", "daily", 1),
    item("/platforms/", "daily", 0.95),
    item("/funds/", "weekly", 0.85),
    item("/methods/", "monthly", 0.85),
    item("/tools/", "monthly", 0.85),
    item("/guides/", "weekly", 0.8),
    item("/glossary/", "monthly", 0.75),
    ...METHODS.map((slug) => item(`/methods/${slug}/`, "monthly", 0.75)),
    ...TOOLS.map((slug) => item(`/tools/${slug}/`, "monthly", 0.8)),
    ...BEST.map((slug) => item(`/best/${slug}/`, "weekly", 0.75)),
    ...GUIDES.map((guide) => ({
      ...item(`/guides/${guide.slug}/`, "monthly", 0.75),
      lastModified: new Date(guide.updatedAt),
    })),
    ...GLOSSARY_TERMS.map((term) =>
      item(`/glossary/${term.slug}/`, "monthly", 0.65),
    ),
  ];
  try {
    const rows = await listDirectoryEntries();
    return [
      ...fixed,
      ...rows.map((row) =>
        item(`/platforms/${row.platform.slug}/`, "weekly", 0.8),
      ),
    ];
  } catch {
    return fixed;
  }
}
