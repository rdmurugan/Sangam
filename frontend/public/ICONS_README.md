# PWA Icon Generation Instructions

## Quick Setup (Automated)

To generate all required PNG icons from the SVG file, you can use online tools or command-line tools:

### Option 1: Using Online Tool (Easiest)
1. Go to https://realfavicongenerator.net/ or https://www.favicon-generator.org/
2. Upload `icon.svg`
3. Download the generated icons
4. Place them in this `public` folder

### Option 2: Using ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Install ImageMagick first (if not installed)
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: Download from https://imagemagick.org/

# Navigate to the public folder
cd frontend/public

# Generate 192x192 icon
convert icon.svg -resize 192x192 logo192.png

# Generate 512x512 icon
convert icon.svg -resize 512x512 logo512.png

# Generate favicon
convert icon.svg -resize 32x32 favicon.ico
```

### Option 3: Using Node.js Script
```bash
# Install sharp package
npm install --save-dev sharp

# Create and run icon generation script
node generate-icons.js
```

## Required Icons for PWA

- **favicon.ico** (32x32) - Browser tab icon
- **logo192.png** (192x192) - Android home screen, smaller displays
- **logo512.png** (512x512) - Android splash screen, larger displays

## Optional Icons for Better Support

- **apple-touch-icon.png** (180x180) - iOS home screen
- **logo256.png** (256x256) - Windows tile
- Various sizes for different devices (144x144, 152x152, 167x167, etc.)

## Icon Design Guidelines

- Use simple, recognizable design
- High contrast for visibility
- Avoid text (becomes unreadable at small sizes)
- Square format with optional rounded corners
- Transparent or solid background
- Test on both light and dark backgrounds

## Current Icon

The `icon.svg` file contains a simple video camera icon with "SANGAM" branding.
Customize this SVG to match your brand before generating PNG files.
