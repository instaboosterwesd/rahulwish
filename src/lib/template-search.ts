export type SearchableTemplate = {
  title: string;
  tagline: string | null;
  category: string;
  badge: string | null;
  slug: string;
  description: string | null;
};

export function templateSearchText(t: SearchableTemplate): string {
  return [t.title, t.tagline ?? "", t.category, t.badge ?? "", t.slug, t.description ?? ""]
    .join(" ")
    .toLowerCase();
}

/** All words must appear somewhere in the template's own text; empty query keeps every template. */
export function filterTemplates<T extends SearchableTemplate>(templates: T[], query: string): T[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return templates;
  return templates.filter((t) => {
    const hay = templateSearchText(t);
    return terms.every((term) => hay.includes(term));
  });
}
