import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = path.join(__dirname, '..', 'data', 'products');

// Read .env manually (no dotenv dependency needed)
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const getEnv = (key) => envContent.match(new RegExp(`^${key}=(.+)`, 'm'))?.[1]?.trim();

const ACCESS_KEY = getEnv('AMAZON_ACCESS_KEY');
const SECRET_KEY = getEnv('AMAZON_SECRET_KEY');
const PARTNER_TAG = getEnv('AMAZON_PARTNER_TAG') || 'senner-21';
const HOST = getEnv('AMAZON_HOST') || 'webservices.amazon.de';
const REGION = getEnv('AMAZON_REGION') || 'eu-west-1';

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('Missing AMAZON_ACCESS_KEY or AMAZON_SECRET_KEY in .env');
  process.exit(1);
}

const API_PATH = '/paapi5/searchitems';
const TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

function signRequest(payload) {
  const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = datetime.substring(0, 8);

  const headers = {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=utf-8',
    host: HOST,
    'x-amz-date': datetime,
    'x-amz-target': TARGET,
  };

  const sortedKeys = Object.keys(headers).sort();
  const signedHeaders = sortedKeys.join(';');
  const canonicalHeaders = sortedKeys.map((k) => `${k}:${headers[k]}`).join('\n') + '\n';
  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');
  const canonicalRequest = `POST\n${API_PATH}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const credentialScope = `${date}/${REGION}/ProductAdvertisingAPI/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const signingKey = hmac(
    hmac(hmac(hmac(`AWS4${SECRET_KEY}`, date), REGION), 'ProductAdvertisingAPI'),
    'aws4_request'
  );
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  headers['authorization'] =
    `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return headers;
}

async function searchProduct(name) {
  const payload = JSON.stringify({
    Keywords: name,
    SearchIndex: 'All',
    ItemCount: 1,
    Resources: ['Images.Primary.Large', 'ItemInfo.Title'],
    PartnerTag: PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.de',
  });

  const headers = signRequest(payload);

  const response = await fetch(`https://${HOST}${API_PATH}`, {
    method: 'POST',
    headers,
    body: payload,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PA-API HTTP ${response.status}: ${text}`);
  }

  return response.json();
}

function extractResult(apiResponse) {
  const items = apiResponse?.SearchResult?.Items;
  if (!items || items.length === 0) return null;
  const item = items[0];
  return {
    asin: item.ASIN,
    imageUrl: item?.Images?.Primary?.Large?.URL ?? null,
    title: item?.ItemInfo?.Title?.DisplayValue ?? null,
  };
}

async function main() {
  const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => f.endsWith('.json'));

  // Load all product files
  const allProducts = {};
  for (const file of files) {
    const filePath = path.join(PRODUCTS_DIR, file);
    allProducts[file] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Collect products that need real ASINs (those without real Amazon image URLs)
  const toProcess = [];
  for (const [file, products] of Object.entries(allProducts)) {
    for (const product of products) {
      const hasRealImage = product.imageUrl?.startsWith('https://m.media-amazon.com');
      if (!hasRealImage) {
        toProcess.push({ file, product });
      }
    }
  }

  console.log(`Total products: 150`);
  console.log(`Products needing real ASINs: ${toProcess.length}`);
  console.log(`Already have real Amazon images: ${150 - toProcess.length}\n`);

  let found = 0;
  let notFound = 0;
  let errors = 0;
  const notFoundList = [];

  for (let i = 0; i < toProcess.length; i++) {
    const { file, product } = toProcess[i];
    const progress = `[${i + 1}/${toProcess.length}]`;

    try {
      console.log(`${progress} Searching: ${product.name}`);
      const result = await searchProduct(product.name);
      const extracted = extractResult(result);

      if (extracted && extracted.asin && extracted.imageUrl) {
        const oldAsin = product.asin;
        product.asin = extracted.asin;
        product.imageUrl = extracted.imageUrl;
        console.log(`  FOUND  ASIN: ${extracted.asin} (was: ${oldAsin})`);
        console.log(`         Title: ${extracted.title}`);
        console.log(`         Image: ${extracted.imageUrl}`);
        found++;
      } else {
        console.log(`  NOT FOUND — keeping existing data`);
        notFound++;
        notFoundList.push(product.name);
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
      errors++;
      notFoundList.push(`[ERROR] ${product.name}`);
    }

    // Rate limit: max 1 request/second
    if (i < toProcess.length - 1) {
      await sleep(1100);
    }
  }

  // Save updated files
  let filesUpdated = 0;
  for (const [file, products] of Object.entries(allProducts)) {
    const filePath = path.join(PRODUCTS_DIR, file);
    const original = fs.readFileSync(filePath, 'utf-8');
    const updated = JSON.stringify(products, null, 2) + '\n';
    if (original !== updated) {
      fs.writeFileSync(filePath, updated);
      console.log(`\nSaved: ${file}`);
      filesUpdated++;
    }
  }

  console.log('\n========================================');
  console.log(`Results:`);
  console.log(`  Found:     ${found}`);
  console.log(`  Not found: ${notFound}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  Files updated: ${filesUpdated}`);

  if (notFoundList.length > 0) {
    console.log('\nProducts not updated (no DE marketplace listing):');
    notFoundList.forEach((n) => console.log(`  - ${n}`));
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
