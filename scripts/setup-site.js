import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
// Using 'with' for Node v22 compatibility
import data from '../src/data/business.json' with { type: 'json' };

dotenv.config();

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const ASSETS_DIR = path.resolve('./src/assets/images');

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

/**
 * 1. SLUG GENERATION
 * Prioritize the JSON slug, fallback to name-based generation.
 */
const brandSlug =
  data.brand?.slug ||
  (data.brand?.name || 'brand')
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]/g, '-');

const brandName = data.brand?.name || 'brand';

/**
 * 2. IMAGE DOWNLOADER
 * Downloads from Unsplash and saves with the brand-specific prefix.
 */
async function fetchUnsplashImage(query, filename) {
  const filePath = path.join(ASSETS_DIR, filename);

  if (fs.existsSync(filePath)) {
    console.log(`- Skipping ${filename} (Already exists)`);
    return;
  }

  try {
    console.log(`🔍 Searching Unsplash for: "${query}"...`);

    const search = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query,
        orientation: 'landscape',
        client_id: ACCESS_KEY
      }
    });

    const downloadUrl = search.data.urls.regular;
    const response = await axios({ url: downloadUrl, method: 'GET', responseType: 'stream' });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    const errorMsg = error.response?.data?.errors?.[0] || error.message;
    console.error(`! Unsplash Error for ${filename}:`, errorMsg);
  }
}

/**
 * 3. RUNNER
 * Orchestrates the Hero and Gallery image naming/downloading.
 */
async function run() {
  if (!ACCESS_KEY) {
    console.error('❌ Error: UNSPLASH_ACCESS_KEY not found in .env file.');
    return;
  }

  console.log(`🚀 Starting Image Factory: ${brandName}`);

  // --- TASK 1: THE HERO ---
  const heroQuery = data?.hero?.image?.image_search_query;
  if (heroQuery) {
    const heroFilename = `${brandSlug}-hero.jpg`;
    await fetchUnsplashImage(heroQuery, heroFilename);
  } else {
    console.log('⚠️ Skipping hero image (missing data.hero.image.image_search_query)');
  }

  // --- TASK 2: THE GALLERY ---
  // Naming Convention: brand-slug-project-0.jpg

  const galleryObj = data.gallery;

  // Support BOTH shapes:
  // A) legacy: data.gallery = [ ... ]
  // B) elite:  data.gallery = { enabled, computed_count, image_source, items: [ ... ] }
  const isLegacyArray = Array.isArray(galleryObj);
  const galleryEnabled = isLegacyArray ? true : (galleryObj?.enabled !== false);
  const galleryItems = isLegacyArray ? galleryObj : (galleryObj?.items || []);

  if (galleryEnabled && galleryItems.length > 0) {
    const desiredCount =
      (!isLegacyArray && typeof galleryObj?.computed_count === 'number')
        ? galleryObj.computed_count
        : galleryItems.length;

    const itemsToProcess = galleryItems.slice(0, Math.max(0, desiredCount));

    console.log(`📸 Processing ${itemsToProcess.length} Gallery Slots...`);

    const globalQuery =
      (!isLegacyArray && galleryObj?.image_source?.image_search_query)
        ? galleryObj.image_source.image_search_query
        : '';

    for (const [index, item] of itemsToProcess.entries()) {
      const galleryQuery =
        item?.image_search_query ||
        globalQuery ||
        item?.alt ||
        data.intelligence?.industry ||
        'professional services';

      const galleryFilename = `${brandSlug}-project-${index}.jpg`;
      await fetchUnsplashImage(galleryQuery, galleryFilename);
    }
  } else {
    console.log('ℹ️ No gallery items to process (gallery disabled or empty).');
  }

  console.log('\n✅ Factory Complete. Assets ready in src/assets/images/');
  console.log(`💡 Assets prefixed with: ${brandSlug}-`);
}

run();
