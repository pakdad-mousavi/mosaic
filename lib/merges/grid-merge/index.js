import path from 'node:path';
import sharp from 'sharp';
import { getSmallestImageDimensions, getFontSize, createSvgTextBuffer } from '../merge-utils.js';
import { progressBar, WRITING_TO_FILE_PERCENTAGE } from '../../helpers/progressBar.js';

export const gridMerge = async (files, images, validatedParams) => {
  // Destructure params
  const { aspectRatio, imageWidth, columns, gap, canvasColor, caption, captionColor, maxCaptionSize } = validatedParams;

  // Calculate width if needed, and height from aspect ratio
  const width = imageWidth || (await getSmallestImageDimensions(images)).smallestWidth;
  const height = Math.floor(width / aspectRatio);

  // resize images to match width and height
  const resizedImages = images.map((image) => {
    return image.resize({
      width,
      height,
      fit: 'cover',
    });
  });

  // Get filenames if needed
  let filenames = null;
  if (caption) {
    filenames = files.map((file) => path.basename(file));
  }

  // Lay images in a grid
  const gridParams = {
    images: resizedImages,
    width,
    height,
    columns,
    gap,
    canvasColor,
    filenames,
    caption,
    captionColor,
    maxCaptionSize,
  };

  return await layImagesInGrid(gridParams);
};

const layImagesInGrid = async (opts) => {
  // Destructure params
  const { images, width, height, columns, gap, canvasColor, filenames, caption, captionColor, maxCaptionSize } = opts;

  // Use 5% of images.length for writing to file
  const fileWriteAmount = Math.ceil(images.length * WRITING_TO_FILE_PERCENTAGE);
  progressBar.start(images.length + fileWriteAmount, 0, {
    stage: 'Merging images',
  });

  // Set constant
  const CAPTION_HEIGHT_TO_CANVAS_WIDTH_RATIO = 0.04;

  // Calculate number of rows
  const rows = Math.ceil(images.length / columns);

  // Calculate canvas width and caption height
  const canvasWidth = width * columns + (columns + 1) * gap;
  const captionHeight = Math.floor(canvasWidth * CAPTION_HEIGHT_TO_CANVAS_WIDTH_RATIO);

  // Calculate canvas height
  const minimumCanvasHeight = height * rows + (rows + 1) * gap;
  const canvasHeight = caption ? minimumCanvasHeight + rows * captionHeight : minimumCanvasHeight;

  // Calculate font size if needed
  let fontSize = null;
  if (caption) {
    const longestFilename = filenames.reduce((longest, current) => {
      return current.length > longest.length ? current : longest;
    });

    fontSize = await getFontSize({
      text: longestFilename,
      maxWidth: width,
      maxHeight: captionHeight,
      initialFontSize: maxCaptionSize,
    });
  }

  // Create canvas
  const canvas = sharp({
    limitInputPixels: false,
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: canvasColor,
    },
  });

  // Collect composites
  const composites = [];

  let x = gap;
  let y = gap;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index >= images.length) break;

      const image = images[index];

      composites.push({
        input: await image.toBuffer(),
        left: x,
        top: y,
      });

      // Add caption if required
      if (caption) {
        // Create text
        const svgBuffer = createSvgTextBuffer({
          text: filenames[index],
          maxWidth: width,
          maxHeight: captionHeight,
          fontSize,
          fill: captionColor,
        });

        // Add text to composites
        composites.push({
          input: svgBuffer,
          left: x,
          top: y + height,
        });
      }

      // Update coordinates
      x += width + gap;

      // Update progress bar
      progressBar.increment();
    }

    // Update coordinates
    y += caption ? height + gap + captionHeight : height + gap;
    x = gap;
  }

  // Create final grid
  canvas.composite(composites);
  return canvas;
};
