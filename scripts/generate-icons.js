/**
 * Icon Generation Script for PWA
 * Run with: node scripts/generate-icons.js
 * 
 * This creates placeholder icons. For production, replace with actual PNG files.
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG template for generating icons
const createSVG = (size, maskable = false) => {
  const padding = maskable ? size * 0.1 : 0;
  const innerSize = size - padding * 2;
  const fontSize = innerSize * 0.5;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#D4A853"/>
      <stop offset="50%" style="stop-color:#C9A227"/>
      <stop offset="100%" style="stop-color:#B8860B"/>
    </linearGradient>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#12121A"/>
      <stop offset="100%" style="stop-color:#08080A"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#bg)"/>
  
  ${maskable ? '' : `<!-- Border glow -->
  <rect x="${size * 0.02}" y="${size * 0.02}" width="${size * 0.96}" height="${size * 0.96}" rx="${size * 0.13}" fill="none" stroke="url(#gold)" stroke-width="${size * 0.005}" opacity="0.6"/>`}
  
  <!-- N letter -->
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" 
        font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}px" fill="url(#gold)">N</text>
</svg>`;
};

// Generate icons
console.log('Generating PWA icons...\n');

sizes.forEach(size => {
  // Regular icon
  const svgContent = createSVG(size, false);
  const filename = `icon-${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Created: ${filename}`);
});

// Generate maskable icons (192 and 512)
[192, 512].forEach(size => {
  const svgContent = createSVG(size, true);
  const filename = `maskable-${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Created: ${filename} (maskable)`);
});

// Generate shortcut icons
const shortcuts = ['training', 'advice', 'techniques'];
shortcuts.forEach(name => {
  const svgContent = createSVG(96, false);
  const filename = `shortcut-${name}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svgContent);
  console.log(`Created: ${filename}`);
});

console.log('\n✅ All icons generated successfully!');
console.log('\nNote: These are SVG placeholders. For production, convert to PNG using:');
console.log('- Sharp library in Node.js');
console.log('- Online tools like realfavicongenerator.net');
console.log('- Design tools like Figma or Photoshop');
