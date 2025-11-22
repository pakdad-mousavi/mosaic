import sharp from 'sharp';
import { scaleImages } from '../merge-utils.js';
import { progressBar, WRITING_TO_FILE_PERCENTAGE } from '../../helpers/progressBar.js';

export const buildHorizontalMasonry = async (images, params) => {
  const { gap, canvasColor, canvasWidth, rowHeight, hAlign } = params;

  // Use 5% of images.length for writing to file
  const fileWriteAmount = Math.ceil(images.length * WRITING_TO_FILE_PERCENTAGE);
  progressBar.start(images.length + fileWriteAmount, 0, {
    stage: 'Merging images',
  });

  // Rescale images to match rowHeight
  const scaledImages = await scaleImages(images, { height: rowHeight });

  // Split images into rows, then calculate canvasHeight
  const rows = await splitIntoRows(scaledImages, canvasWidth, gap, hAlign);
  const canvasHeight = rows.length * rowHeight + (rows.length + 1) * gap;

  // Create and return grid of images
  return await createMasonryLayout(rows, rowHeight, canvasWidth, canvasHeight, canvasColor, gap, hAlign);
};

const createMasonryLayout = async (rows, rowHeight, canvasWidth, canvasHeight, canvasColor, gap, hAlign) => {
  const canvas = sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: canvasColor,
    },
  });

  const composites = [];

  let currentWidth = gap;
  let x = gap;
  let y = gap;

  for (const row of rows) {
    const rowXStart = await computeRowXOffset(row, canvasWidth, gap, hAlign);
    x = rowXStart;

    for (const im of row) {
      const meta = await im.metadata();
      let finalizedImage = im;
      let finalizedMeta = meta;
      currentWidth += meta.width + gap;

      if (currentWidth >= canvasWidth) {
        // Calculate overflow
        const overflow = currentWidth - canvasWidth;

        // Resize (crop) image to justify
        const resizeOptions = {
          width: meta.width - overflow,
          height: meta.height,
          fit: 'cover',
        };

        // Update finalized image and metadata
        const buff = await im.resize(resizeOptions).toBuffer();
        finalizedImage = sharp(buff);
        finalizedMeta = await finalizedImage.metadata();
      }

      composites.push({
        input: await finalizedImage.toBuffer(),
        left: x,
        top: y,
      });

      x += finalizedMeta.width + gap;

      // Update progress
      progressBar.increment();
    }

    x = gap;
    currentWidth = gap;
    y += rowHeight + gap;
  }

  return canvas.composite(composites);
};

const splitIntoRows = async (images, canvasWidth, gap, hAlign) => {
  const rows = [];
  let currentRow = [];
  let currentWidth = gap; // initial leading gap

  for (const im of images) {
    const meta = await im.metadata();
    const nextWidth = currentWidth + meta.width + gap;

    if (hAlign === 'justified') {
      // Greedy: always push image, fix overflow later
      currentRow.push(im);
      currentWidth = nextWidth;

      if (currentWidth + gap >= canvasWidth) {
        rows.push(currentRow.slice());
        currentRow.length = 0;
        currentWidth = gap;
      }
    } else {
      // Non-greedy: break BEFORE adding image that doesn't fit
      if (nextWidth > canvasWidth && currentRow.length > 0) {
        rows.push(currentRow.slice());
        currentRow = [];
        currentWidth = gap;
      }

      // Add the image (may be first in a new row)
      currentRow.push(im);
      currentWidth += meta.width + gap;
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
};

const computeRowXOffset = async (row, canvasWidth, gap, hAlign) => {
  // Calculate total row width
  let totalWidth = gap * (row.length + 1);
  for (const im of row) {
    const meta = await im.metadata();
    totalWidth += meta.width;
  }

  // Get x offset
  if (hAlign === 'left' || hAlign === 'justified') {
    return gap;
  }
  if (hAlign === 'right') {
    return canvasWidth - totalWidth + gap;
  }
  if (hAlign === 'center') {
    const canvasGap = gap * 2;
    return Math.floor((canvasWidth + canvasGap - totalWidth) / 2);
  }
};
