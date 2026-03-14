import { readFileSync } from "fs";
import { join } from "path";

export interface SisterSite {
  name: string;
  url: string;
  tagline: string;
  categories: string[];
}

interface SisterSitesData {
  sites: SisterSite[];
}

const DATA_DIR = join(process.cwd(), "data");

function loadSisterSites(): SisterSite[] {
  const raw = readFileSync(join(DATA_DIR, "sister-sites.json"), "utf-8");
  const data = JSON.parse(raw) as SisterSitesData;
  return data.sites;
}

export function getSisterSitesForCategory(category: string): SisterSite[] {
  const sites = loadSisterSites();
  return sites.filter(
    (site) => site.categories.includes("all") || site.categories.includes(category)
  );
}

export function getAllSisterSites(): SisterSite[] {
  return loadSisterSites();
}
