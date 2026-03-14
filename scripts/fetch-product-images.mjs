import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_DIR = path.join(__dirname, '..', 'data', 'products');

const ACCESS_KEY = 'REDACTED_ACCESS_KEY';
const SECRET_KEY = 'REDACTED_SECRET_KEY';
const PARTNER_TAG = 'REDACTED_PARTNER_TAG';
const HOST = 'webservices.amazon.de';
const REGION = 'eu-west-1';
const API_PATH = '/paapi5/getitems';
const TARGET = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data).digest();
}

async function getItemImages(asins) {
  const payload = JSON.stringify({
    ItemIds: asins,
    Resources: ['Images.Primary.Large'],
    PartnerTag: PARTNER_TAG,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.de',
  });

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
  const canonicalHeaders = sortedKeys.map(k => `${k}:${headers[k]}`).join('\n') + '\n';
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

function extractImageUrl(apiResponse, asin) {
  const items = apiResponse?.ItemsResult?.Items;
  if (!items) return null;
  const item = items.find(i => i.ASIN === asin);
  return item?.Images?.Primary?.Large?.URL ?? null;
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  // Load all product files and collect ASINs
  const files = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.json'));

  const allProducts = {};
  for (const file of files) {
    const filePath = path.join(PRODUCTS_DIR, file);
    const products = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    allProducts[file] = products;
  }

  const asinToFiles = {};
  for (const [file, products] of Object.entries(allProducts)) {
    for (const product of products) {
      if (product.asin) {
        if (!asinToFiles[product.asin]) asinToFiles[product.asin] = [];
        asinToFiles[product.asin].push(file);
      }
    }
  }

  const allAsins = Object.keys(asinToFiles);
  console.log(`Found ${allAsins.length} ASINs across ${files.length} product files`);

  const batches = chunkArray(allAsins, 10);
  console.log(`Processing ${batches.length} batches of up to 10 ASINs each\n`);

  const imageMap = {};
  let found = 0;
  let notFound = 0;
  let errors = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`Batch ${i + 1}/${batches.length}: ${batch.join(', ')}`);

    try {
      const result = await getItemImages(batch);

      // Log any errors returned by the API for specific items
      if (result?.Errors) {
        for (const err of result.Errors) {
          console.log(`  API error for some item: ${err.Code} - ${err.Message}`);
        }
      }

      for (const asin of batch) {
        const url = extractImageUrl(result, asin);
        if (url) {
          imageMap[asin] = url;
          console.log(`  FOUND  ${asin}: ${url}`);
          found++;
        } else {
          console.log(`  NOT FOUND ${asin}`);
          notFound++;
        }
      }
    } catch (err) {
      console.error(`  Batch error: ${err.message}`);
      errors += batch.length;
    }

    // Rate limit: 1 request/second max
    if (i < batches.length - 1) {
      await sleep(1100);
    }
  }

  console.log(`\nResults: ${found} found, ${notFound} not found, ${errors} errors`);

  // Update product files with real image URLs
  let updated = 0;
  for (const [file, products] of Object.entries(allProducts)) {
    let fileChanged = false;
    for (const product of products) {
      if (product.asin && imageMap[product.asin]) {
        product.imageUrl = imageMap[product.asin];
        fileChanged = true;
        updated++;
      }
    }
    if (fileChanged) {
      const filePath = path.join(PRODUCTS_DIR, file);
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2) + '\n');
      console.log(`Updated ${file}`);
    }
  }

  console.log(`\nDone. Updated imageUrl for ${updated} products.`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
