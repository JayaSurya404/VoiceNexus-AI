export function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || "organization";
}

export async function uniqueSlug(
  value: string,
  exists: (candidate: string) => Promise<boolean>,
  suffixFactory: () => string = () => Date.now().toString(36),
): Promise<string> {
  const base = slugify(value);

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;

    if (!(await exists(candidate))) {
      return candidate;
    }
  }

  const suffix = slugify(suffixFactory()).slice(0, 12);
  const fallback = `${base}-${suffix || "unique"}`.slice(0, 80);

  if (!(await exists(fallback))) {
    return fallback;
  }

  throw new Error("Unable to generate a unique organization slug");
}
