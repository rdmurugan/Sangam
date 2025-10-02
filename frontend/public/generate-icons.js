// Icon Generation Script
// This script converts the icon.svg to various PNG sizes needed for PWA

const fs = require('fs');
const path = require('path');

console.log('📱 PWA Icon Generator');
console.log('====================\n');

// Check if icon.svg exists
const svgPath = path.join(__dirname, 'icon.svg');
if (!fs.existsSync(svgPath)) {
  console.error('❌ Error: icon.svg not found in public folder');
  console.log('Please create icon.svg first');
  process.exit(1);
}

console.log('✅ Found icon.svg');

// Try to use sharp for conversion
try {
  const sharp = require('sharp');

  const sizes = [
    { name: 'favicon.ico', size: 32, format: 'png' },
    { name: 'logo192.png', size: 192, format: 'png' },
    { name: 'logo512.png', size: 512, format: 'png' },
  ];

  console.log('\n🎨 Generating PNG icons...\n');

  Promise.all(
    sizes.map(({ name, size, format }) => {
      return sharp(svgPath)
        .resize(size, size)
        .toFormat(format)
        .toFile(path.join(__dirname, name))
        .then(() => {
          console.log(`✅ Generated ${name} (${size}x${size})`);
        });
    })
  )
    .then(() => {
      console.log('\n✨ All icons generated successfully!');
      console.log('\nYou can now:');
      console.log('1. Test your PWA in the browser');
      console.log('2. Look for the "Install" button in the address bar');
      console.log('3. Check the InstallPWA banner at the bottom of the page');
    })
    .catch((error) => {
      console.error('\n❌ Error generating icons:', error.message);
      console.log('\nPlease install sharp: npm install --save-dev sharp');
    });

} catch (error) {
  console.log('\n⚠️  Sharp package not found');
  console.log('\nTo generate icons automatically:');
  console.log('1. Install sharp: npm install --save-dev sharp');
  console.log('2. Run this script again: node public/generate-icons.js');
  console.log('\nOr use ImageMagick (see ICONS_README.md for instructions)');
  console.log('\nOr use online tool: https://realfavicongenerator.net/');
}
