import sharp from 'sharp';
import { getSmallestImageDimensions, scaleImages } from '../merge-utils.js';

let counter = 1;

export const aspectMerge = async (images, validatedParams) => {
  // Destructure params
  const { aspectRatio, imageWidth, columns, caption, captionColor, gap, canvasColor } = validatedParams;

  // Calculate width if needed, and height from aspect ratio
  const width = imageWidth || (await getSmallestImageDimensions(images)).smallestWidth;
  const height = Math.floor(width / aspectRatio);

  // resize images to match width and height
  const resizedImages = images.map((image) => {
    return image.resize({
      width,
      height,
      fit: 'fill',
    });
  });

  return await layImagesInGrid({ images: resizedImages, width, height, columns, gap, canvasColor });
};

const layImagesInGrid = async (opts) => {
  // Destructure params
  const { images, width, height, columns, gap, canvasColor } = opts;

  // Calculate number of rows
  const rows = Math.ceil(images.length / columns);

  // Calculate canvas width and height
  const canvasWidth = width * columns + (columns + 1) * gap;
  const canvasHeight = height * rows + (rows + 1) * gap;

  // Create canvas
  const canvas = sharp({
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

      x += width + gap;
    }

    y += height + gap;
    x = gap;
  }

  // Create final grid
  canvas.composite(composites);
  return canvas;
};
