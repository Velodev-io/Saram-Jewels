const { Jimp } = require('jimp');

/**
 * Processes a base64 image to make it square and optimized for the jewelry website.
 */
const processJewelryImage = async (base64Str) => {
  if (!base64Str || !base64Str.startsWith('data:image')) return base64Str;

  try {
    const matches = base64Str.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
    if (!matches) return base64Str;
    
    const buffer = Buffer.from(matches[2], 'base64');
    const image = await Jimp.read(buffer);

    const targetSize = 800;

    // Use a simpler approach that is more likely to work across Jimp versions
    // Resize maintaining aspect ratio
    image.contain({ w: targetSize, h: targetSize });

    // Get back as base64
    return await image.getBase64('image/jpeg');
  } catch (error) {
    console.error('Image processing failed:', error);
    return base64Str; 
  }
};

module.exports = { processJewelryImage };
