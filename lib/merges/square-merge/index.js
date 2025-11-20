import path from 'node:path';
import sharp from 'sharp';
import { createSvgTextBuffer, getFontSize, getSmallestImageDimensions } from '../merge-utils.js';

export const squareMerge = async (files, images, opts) => {
  const { gap, canvasColor, fitMode, imageSize, paddingColor, columns, caption, captionColor, maxCaptionSize } = opts;

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
  const grid = await layImagesInGrid({
    files,
    images: normalizedImages,
    columns,
    size: newImageSize,
    gap,
    canvasColor,
    caption,
    captionColor,
    maxCaptionSize,
  });
  return grid;
};

export const layImagesInGrid = async (opts) => {
  const CAPTION_HEIGHT_TO_CANVAS_WIDTH_RATIO = 0.04;

  // Destructure params
  const { files, images, columns, size, gap, canvasColor, caption, captionColor, maxCaptionSize } = opts;

  // Calculate base variables
  const rows = Math.ceil(images.length / columns);
  const canvasWidth = columns * size + (columns + 1) * gap;
  const captionHeight = Math.floor(canvasWidth * CAPTION_HEIGHT_TO_CANVAS_WIDTH_RATIO);

  // Get filenames and fontsize if needed
  let filenames = null;
  let fontSize = null;
  if (caption) {
    filenames = files.map((file) => path.basename(file));

    const longestFilename = filenames.reduce((longest, current) => {
      return current.length > longest.length ? current : longest;
    });

    fontSize = await getFontSize({
      text: longestFilename,
      maxWidth: size,
      maxHeight: captionHeight,
      initialFontSize: maxCaptionSize,
    });
  }

  const minimumCanvasHeight = rows * size + (rows + 1) * gap;
  const canvasHeight = caption ? minimumCanvasHeight + rows * captionHeight : minimumCanvasHeight;

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
      const y = caption ? gap + row * (size + gap + captionHeight) : gap + row * (size + gap);

      composites.push({
        input: await images[idx].toBuffer(), // ensure buffer
        left: x,
        top: y,
      });

      // Add caption if required
      if (caption) {
        // Create text
        const svgBuffer = createSvgTextBuffer({
          text: filenames[idx],
          maxWidth: size,
          maxHeight: captionHeight,
          fontSize,
          fill: captionColor,
        });

        // Add text to composites
        composites.push({
          input: svgBuffer,
          left: x,
          top: y + size,
        });
      }
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
