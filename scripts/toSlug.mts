export const toSlug = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word: string) => word.replace(/[^a-z0-9-]/g, ""))
    .join("-");
