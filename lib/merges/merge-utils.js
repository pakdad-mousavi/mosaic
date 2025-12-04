import sharp from 'sharp';

export const calculateAvgHeight = async (images) => {
  let totalHeight = 0;

  for (const img of images) {
    const meta = await img.metadata();
    totalHeight += meta.height;
  }

  return Math.floor(totalHeight / images.length);
};

export const calculateAvgWidth = async (images) => {
  let totalWidth = 0;

  for (const img of images) {
    const meta = await img.metadata();
    totalWidth += meta.width;
  }

  return Math.floor(totalWidth / images.length);
};

export const scaleImages = async (images, { width = null, height = null }) => {
  if (!width && !height) {
    throw new Error('You must provide either width or height.');
  }

  const scaledImages = await Promise.all(
    images.map(async (image) => {
      const meta = await image.metadata();

      let targetWidth, targetHeight;

      if (width && height) {
        targetWidth = width;
        targetHeight = height;
      } else if (width) {
        const f = width / meta.width;
        targetWidth = width;
        targetHeight = Math.floor(meta.height * f);
      } else {
        const f = height / meta.height;
        targetHeight = height;
        targetWidth = Math.floor(meta.width * f);
      }

      const buffer = await image.resize(targetWidth, targetHeight).toBuffer();

      return sharp(buffer);
    })
  );

  return scaledImages;
};

export const getSmallestImageDimensions = async (images) => {
  const metas = await Promise.all(images.map((img) => img.metadata()));

  return metas.reduce(
    (acc, meta) => ({
      smallestWidth: Math.min(acc.smallestWidth, meta.width),
      smallestHeight: Math.min(acc.smallestHeight, meta.height),
    }),
    { smallestWidth: Infinity, smallestHeight: Infinity }
  );
};

export const getFontSize = async ({
  text,
  maxWidth,
  maxHeight,
  initialFontSize = 100,
  minFontSize = 2,
  fontFamily = 'sans-serif',
}) => {
  const THRESHOLD = 200;
  const SMALL_CHANGE = 2;
  const LARGE_CHANGE = 5;

  let fontSize = initialFontSize;

  while (fontSize >= minFontSize) {
    // No width or viewport given so that the actual size can be determined after rasterization
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg">
      <text
        x="${maxWidth / 2}"
        y="10"
        font-size="${fontSize}"
        font-family="${fontFamily}"
        fill="#000000"
        text-anchor="middle"
        dominant-baseline="middle">
        ${escapeXML(text)}
      </text>
    </svg>
    `;

    // Rasterize SVG: measure actual rendered size
    const raster = await sharp(Buffer.from(svg)).png().toBuffer();
    const meta = await sharp(raster).metadata();

    if (meta.width <= maxWidth && meta.height <= maxHeight) {
      return fontSize;
    }

    // If the difference is greater than the threshold, use large change
    if (maxWidth - meta.width > THRESHOLD || maxHeight - meta.height) {
      fontSize -= LARGE_CHANGE;
    } else {
      fontSize -= SMALL_CHANGE;
    }
  }

  return minFontSize;
};

export const createSvgTextBuffer = ({ text, maxWidth, maxHeight, fontSize, fill = '#000000', fontFamily = 'sans-serif' }) => {
  // Width and viewport are assigned to this svg
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="${maxWidth}" height="${maxHeight}"
         viewBox="0 0 ${maxWidth} ${maxHeight}">
      <text
        x="${maxWidth / 2}"
        y="${maxHeight / 2}"
        font-size="${fontSize}"
        font-family="${fontFamily}"
        fill="${fill}"
        text-anchor="middle"
        dominant-baseline="middle">
        ${escapeXML(text)}
      </text>
    </svg>
    `;

  return Buffer.from(svg);
};

const escapeXML = (str) => {
  return str.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      }[c])
  );
};

export const roundImages = async (images, { width, height, cornerRadius }) => {
  // Skip if the cornerRadius = zero
  if (!cornerRadius) return images;

  // Round images respectively
  return await Promise.all(
    images.map(async (image) => {
      const mask = Buffer.from(`
        <svg width="${width}" height="${height}">
          <rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}" />
          </svg>
      `);

      const buff = await image
        .composite([{ input: mask, blend: 'dest-in' }])
        .png()
        .toBuffer();
      return sharp(buff);
    })
  );
};
