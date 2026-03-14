import { readFileSync, readdirSync } from "fs";
import { join } from "path";

export interface Product {
  asin: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  currency: "USD";
  rating: number;
  reviewCount: number;
  imageUrl: string;
  features: string[];
  pros: string[];
  cons: string[];
  specs: Record<string, string>;
  isBestSeller?: boolean;
  isAmazonChoice?: boolean;
  lastUpdated: string;
}

export interface Category {
  slug: string;
  name: string;
  displayName: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  icon: string;
  commissionTier: "tier1" | "tier2";
}

export interface ComparisonPoint {
  label: string;
  a: string;
  b: string;
  winner: "a" | "b" | "tie";
}

export interface Comparison {
  slug: string;
  productA: string;
  productB: string;
  categorySlug: string;
  winner?: string;
  verdict: string;
  comparisonPoints: ComparisonPoint[];
}

const DATA_DIR = join(process.cwd(), "data");

function readProductFile(filePath: string): Product[] {
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as Product[];
}

export function getAllProducts(): Product[] {
  const productsDir = join(DATA_DIR, "products");
  const files = readdirSync(productsDir).filter((f) => f.endsWith(".json"));
  const all: Product[] = [];
  for (const file of files) {
    const products = readProductFile(join(productsDir, file));
    all.push(...products);
  }
  return all;
}

export function getProductsByCategory(slug: string): Product[] {
  return getAllProducts().filter((p) => p.category === slug);
}

export function getProduct(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function getProductByAsin(asin: string): Product | undefined {
  return getAllProducts().find((p) => p.asin === asin);
}
