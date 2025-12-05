import sharp from 'sharp';
import { progressBar, WRITING_TO_FILE_PERCENTAGE } from '../../helpers/progressBar.js';

export const collageMerge = async (images, validatedParams) => {
  const { template } = validatedParams;

  // Set up progress bar
  const total = Math.min(images.length, template.slots.length) * 2;
  const totalFileWrite = Math.ceil(total * WRITING_TO_FILE_PERCENTAGE);
  progressBar.start(total + totalFileWrite, 0, {
    stage: 'Calculating dimensions',
  });

  // Calculate each column's width and height
  const workableCanvasWidth = template.canvas.width - template.canvas.gap * (template.canvas.columns + 1);
  const workableCanvasHeight = template.canvas.height - template.canvas.gap * (template.canvas.rows + 1);
  const columnWidth = workableCanvasWidth / template.canvas.columns;
  const rowHeight = workableCanvasHeight / template.canvas.rows;

  // Each block has its resized image with its respective slot coordinates
  progressBar.update({ stage: 'Resizing images' });
  const blocks = await getBlocks({
    slots: template.slots,
    images,
    gap: template.canvas.gap,
    columnWidth,
    rowHeight,
  });

  // Lay blocks
  progressBar.update({ stage: 'Merging images' });
  const collage = layBlocks({
    canvasOptions: template.canvas,
    blocks,
    columnWidth,
    rowHeight,
  });

  return collage;
};

const getBlocks = async ({ slots, images, gap, columnWidth, rowHeight }) => {
  const blocks = [];

  for (let i = 0; i < slots.length && i < images.length; i++) {
    const slot = slots[i];
    const image = images[i];

    // Calculate image width and height
    const width = slot.colSpan * columnWidth + (slot.colSpan - 1) * gap;
    const height = slot.rowSpan * rowHeight + (slot.rowSpan - 1) * gap;

    // Resize image respectively
    const imageBuffer = await image.resize({ width: Math.floor(width), height: Math.floor(height) }).toBuffer();
    blocks.push({ imageBuffer, col: slot.col, row: slot.row });

    progressBar.increment();
  }

  return blocks;
};

const layBlocks = ({ canvasOptions, blocks, columnWidth, rowHeight }) => {
  // Create canvas
  const canvas = sharp({
    limitInputPixels: false,
    create: {
      background: canvasOptions.background,
      channels: 4,
      width: canvasOptions.width,
      height: canvasOptions.height,
    },
  });

  const composites = [];

  // Collect composites
  for (const block of blocks) {
    const x = (block.col - 1) * columnWidth + block.col * canvasOptions.gap;
    const y = (block.row - 1) * rowHeight + block.row * canvasOptions.gap;

    composites.push({
      input: block.imageBuffer,
      left: Math.floor(x),
      top: Math.floor(y),
    });

    progressBar.increment();
  }

  canvas.composite(composites);
  return canvas;
};
