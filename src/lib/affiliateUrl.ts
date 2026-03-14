const PARTNER_TAG =
  import.meta.env.AMAZON_PARTNER_TAG || "superkitchentools-20";

export function affiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${PARTNER_TAG}`;
}
