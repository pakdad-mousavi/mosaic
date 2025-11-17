import sharp from 'sharp';
import { scaleImages } from './utils.js';

export const buildVerticalMasonry = async (images, params) => {
  const { gap, canvasColor, canvasHeight, columnWidth, vAlign } = params;

  // Rescale images to match columnWidth
  const scaledImages = await scaleImages(images, { width: columnWidth });

  // Split images into columns, then calculate canvasWidth
  const columns = await splitIntoColumns(scaledImages, canvasHeight, gap, vAlign);
  console.log(columns.length);
  columns.forEach((col) => {
    console.log(col.length);
  });
  const canvasWidth = columns.length * columnWidth + (columns.length + 1) * gap;

  // Create and return grid of images
  return await createMasonryLayout(columns, columnWidth, canvasWidth, canvasHeight, canvasColor, gap, vAlign);
};

const createMasonryLayout = async (cols, columnWidth, canvasWidth, canvasHeight, canvasColor, gap, vAlign) => {
  const composites = [];

  const canvas = sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: canvasColor,
    },
  });

  let x = gap;
  let currentHeight = gap;

  for (const col of cols) {
    let y = await computeColYOffset(col, canvasHeight, gap, vAlign);

    for (const im of col) {
      let finalizedImage = im;
      let finalizedMeta = await im.metadata();

      currentHeight += finalizedMeta.height + gap;

      if (currentHeight >= canvasHeight) {
        const yOverflow = currentHeight - canvasHeight;

        const resizeOptions = {
          width: finalizedMeta.width,
          height: finalizedMeta.height - yOverflow,
          fit: 'cover',
        };

        const buffer = await finalizedImage.resize(resizeOptions).toBuffer();
        finalizedImage = sharp(buffer);
        finalizedMeta = await finalizedImage.metadata();
      }

      composites.push({
        input: await finalizedImage.toBuffer(),
        left: x,
        top: y,
      });

      y += finalizedMeta.height + gap;
    }

    y = gap;
    currentHeight = gap;
    x += columnWidth + gap;
  }

  return canvas.composite(composites);
};

const splitIntoColumns = async (images, canvasHeight, gap, vAlign) => {
  const cols = [];
  const currentCol = [];
  let currentHeight = gap;

  for (const im of images) {
    const meta = await im.metadata();
    let nextHeight = currentHeight + meta.height + gap;

    if (vAlign === 'justified') {
      // Greedy: always push image, fix overflow later
      currentCol.push(im);
      currentHeight = nextHeight;

      if (currentHeight + gap >= canvasHeight) {
        cols.push(currentCol.slice());
        currentCol.length = 0;
        currentHeight = gap;
      }
    } else {
      // Non-greedy: break BEFORE adding image that doesn't fit
      if (nextHeight > canvasHeight && currentCol.length > 0) {
        cols.push(currentCol.slice());
        currentCol.length = 0;
        currentHeight = gap;
      }

      // Add the image (may be first in a new column)
      currentCol.push(im);
      currentHeight += meta.height + gap;
    }
  }

  if (currentCol.length > 0) {
    cols.push(currentCol);
  }

  return cols;
};

const computeColYOffset = async (col, canvasHeight, gap, vAlign) => {
  // Calculate total row width
  let totalHeight = gap * (col.length + 1);
  for (const im of col) {
    const meta = await im.metadata();
    totalHeight += meta.height;
  }

  // Get x offset
  if (vAlign === 'top' || vAlign === 'justified') {
    return gap;
  }
  if (vAlign === 'bottom') {
    return canvasHeight - totalHeight + gap;
  }
  if (vAlign === 'middle') {
    const canvasGap = gap * 2;
    return Math.floor((canvasHeight + canvasGap - totalHeight) / 2);
  }
};
