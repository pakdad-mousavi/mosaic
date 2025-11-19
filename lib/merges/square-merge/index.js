import sharp from 'sharp';
import { getSmallestImageDimensions } from '../merge-utils.js';

export const squareMerge = async (images, opts) => {
  const { gap, canvasColor, fitMode, imageSize, paddingColor, columns } = opts;

  // Determine target size
  let newImageSize;
  if (imageSize) {
    // Use user-provided size directly
    newImageSize = imageSize;
  } else {
    // Use smallest dimensions if imageSize is not provided
    const { smallestWidth, smallestHeight } = await getSmallestImageDimensions(images);
    newImageSize = Math.min(smallestWidth, smallestHeight);
  }

  // Convert / normalize images (square, pad/crop, resize)
  const normalizedImages = await normalizeImages(images, paddingColor, newImageSize, fitMode);

  // Lay images in a grid and return
  const grid = await layImagesInGrid(normalizedImages, columns, newImageSize, gap, canvasColor);
  return grid;
};

export const layImagesInGrid = async (images, columns, size, gap, canvasColor) => {
  const rows = Math.ceil(images.length / columns);

  const canvasWidth = columns * size + (columns + 1) * gap;
  const canvasHeight = rows * size + (rows + 1) * gap;

  // Create blank canvas
  let canvas = sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: canvasColor,
    },
  });

  // Build composite array
  const composites = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const idx = row * columns + col;
      if (idx >= images.length) break;

      const x = gap + col * (size + gap);
      const y = gap + row * (size + gap);

      composites.push({
        input: await images[idx].toBuffer(), // ensure buffer
        left: x,
        top: y,
      });
    }
  }

  // Composite all images at once
  canvas = canvas.composite(composites);

  return canvas;
};

const normalizeImages = async (images, paddingColor, targetSize, fitMode) => {
  return images.map((image) =>
    image.resize({
      fit: fitMode,
      width: targetSize,
      height: targetSize,
      background: paddingColor,
    })
  );
};
