import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const WIDTH = 1200;
const HEIGHT = 630;

async function generateOGP() {
  // Load and resize hero image to cover OGP dimensions
  const heroImage = sharp(join(projectRoot, 'public/images/hero-bg.png'))
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' });

  // Create dark gradient overlay using SVG
  const overlay = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(17,24,39);stop-opacity:0.95" />
          <stop offset="40%" style="stop-color:rgb(17,24,39);stop-opacity:0.7" />
          <stop offset="70%" style="stop-color:rgb(17,24,39);stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:rgb(17,24,39);stop-opacity:0.15" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:rgb(17,24,39);stop-opacity:0.5" />
          <stop offset="60%" style="stop-color:rgb(17,24,39);stop-opacity:0" />
        </linearGradient>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad1)" />
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad2)" />
    </svg>
  `);

  // Create text overlay with SVG
  const textOverlay = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}">
      <style>
        .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 800; }
        .subtitle { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 400; }
        .badge { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-weight: 600; }
      </style>

      <!-- Badge -->
      <rect x="70" y="260" width="230" height="32" rx="16" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
      <text x="185" y="282" text-anchor="middle" class="badge" fill="rgba(255,255,255,0.8)" font-size="14">Startup &amp; Design Blog</text>

      <!-- Main title -->
      <text x="70" y="360" class="title" fill="white" font-size="64">Like a</text>
      <text x="70" y="440" class="title" fill="white" font-size="64">Silicon Valley</text>

      <!-- Blue glow effect for Silicon Valley -->
      <text x="70" y="440" class="title" fill="rgba(9,111,202,0.3)" font-size="64" filter="url(#glow)">Silicon Valley</text>

      <!-- Description -->
      <text x="70" y="500" class="subtitle" fill="rgba(255,255,255,0.75)" font-size="18">Goodpatch創業者 土屋尚史のブログ since 2010</text>

      <!-- Bottom accent line -->
      <rect x="70" y="550" width="120" height="3" rx="1.5" fill="#096FCA" />

      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  `);

  // Compose final image
  await heroImage
    .composite([
      { input: overlay, blend: 'over' },
      { input: textOverlay, blend: 'over' },
    ])
    .png({ quality: 90 })
    .toFile(join(projectRoot, 'public/images/ogp.png'));

  console.log('✅ OGP image generated: public/images/ogp.png (1200x630)');
}

generateOGP().catch(console.error);
