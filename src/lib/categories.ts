import { readFileSync } from "fs";
import { join } from "path";
import type { Category } from "./products.ts";

const DATA_DIR = join(process.cwd(), "data");

export function getAllCategories(): Category[] {
  const raw = readFileSync(join(DATA_DIR, "categories.json"), "utf-8");
  return JSON.parse(raw) as Category[];
}

export function getCategory(slug: string): Category | undefined {
  return getAllCategories().find((c) => c.slug === slug);
}
