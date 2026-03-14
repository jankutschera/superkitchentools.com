import type { Product } from "./products.ts";
import { affiliateUrl } from "./affiliateUrl.ts";

export function generateProductSchema(product: Product): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    description: product.features.join(" "),
    image: product.imageUrl,
    offers: {
      "@type": "Offer",
      url: affiliateUrl(product.asin),
      priceCurrency: product.currency,
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      priceValidUntil: new Date(
        new Date().getFullYear() + 1,
        0,
        1
      ).toISOString().split("T")[0],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: "5",
      worstRating: "1",
    },
  };
  return JSON.stringify(schema);
}

export function generateItemListSchema(
  products: Product[],
  listName: string
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: `https://superkitchentools.com/reviews/${product.slug}/`,
    })),
  };
  return JSON.stringify(schema);
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return JSON.stringify(schema);
}

export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  return JSON.stringify(schema);
}
