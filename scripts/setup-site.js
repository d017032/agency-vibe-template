import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
// Using 'with' for Node v22 compatibility
import data from '../src/data/business.json' with { type: 'json' };

// 1. Load Environment Variables (Your Unsplash Key)
dotenv.config();

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const ASSETS_DIR = path.resolve('./src/assets/images');

// 2. Ensure the images directory exists
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// 3. Slug logic (Matches Hero.astro for self-healing paths)
const brandSlug = data.brand.name.toLowerCase()
    .replace(/'/g, '') 
    .replace(/[^a-z0-9]/g, '-');

/**
 * FETCH IMAGE FROM UNSPLASH
 * Uses targeted queries to get industry-specific high-quality photos.
 */
async function fetchUnsplashImage(query, filename) {
    const filePath = path.join(ASSETS_DIR, filename);
    
    // Safety check: Don't waste API credits if file exists
    if (fs.existsSync(filePath)) {
        console.log(`- Skipping ${filename} (Already exists)`);
        return;
    }

    try {
        console.log(`🔍 Searching Unsplash for: "${query}"...`);
        
        const search = await axios.get(`https://api.unsplash.com/photos/random`, {
            params: { 
                query: query, 
                orientation: 'landscape', 
                client_id: ACCESS_KEY 
            }
        });

        const downloadUrl = search.data.urls.regular;
        const response = await axios({ 
            url: downloadUrl, 
            method: 'GET', 
            responseType: 'stream' 
        });
        
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
 * MAIN RUNNER
 */
async function run() {
    if (!ACCESS_KEY) {
        console.error("❌ Error: UNSPLASH_ACCESS_KEY not found in .env file.");
        return;
    }

    console.log(`🚀 Starting Image Factory for: ${data.brand.name}`);

    // --- TASK 1: THE HERO ---
    // Combined Industry + Vibe for a specific "look"
    const heroQuery = `${data.intelligence.industry} ${data.settings.vibe} interior`;
    await fetchUnsplashImage(heroQuery, `${brandSlug}-hero.jpg`);

    // --- TASK 2: THE GALLERY ---
    if (data.gallery && Array.isArray(data.gallery)) {
        console.log(`📸 Found ${data.gallery.length} gallery images to fetch...`);
        
        for (const item of data.gallery) {
            // Use the AI-generated alt text for highly relevant search results
            const galleryQuery = `${data.intelligence.industry} ${item.alt}`;
            
            // Clean the filename (handles potential /images/ pathing from AI)
            const filename = item.src.split('/').pop();
            
            await fetchUnsplashImage(galleryQuery, filename);
        }
    }

    console.log('\n✅ Factory Complete. All images are optimized in src/assets/images/');
}

run();