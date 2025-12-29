// Script to generate PWA icons
// Run: node scripts/generate-icons.js
// Requires: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];

async function generateIcons() {
  // Create a simple icon SVG
  const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#3B82F6"/>
      <text x="256" y="300" font-family="Arial, sans-serif" font-size="200" font-weight="bold" fill="white" text-anchor="middle">T</text>
    </svg>
  `;

  for (const size of sizes) {
    const outputPath = path.join(__dirname, '..', 'public', `icon-${size}.png`);
    
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`Generated icon-${size}.png`);
  }
}

generateIcons().catch(console.error);

