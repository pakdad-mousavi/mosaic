import sharp from 'sharp';

export const buildHorizontalMasonry = async (images, params) => {
  console.log(params);
  const { gap, canvasColor, canvasWidth, rowHeight, hAlign } = params;
  // 1. Rescale images to match rowHeight
  const scaledImages = await scaleImagesToHeight(images, rowHeight);

  // 2. Split images into rows, then calculate canvasHeight
  const rows = await splitIntoRows(scaledImages, canvasWidth, gap);
  const canvasHeight = rows.length * rowHeight + (rows.length + 1) * gap;

  // 3. Create and return grid of images
  return await layImagesInGrid(rows, rowHeight, canvasWidth, canvasHeight, canvasColor, gap);
};

const layImagesInGrid = async (rows, rowHeight, canvasWidth, canvasHeight, canvasColor, gap) => {
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
    }

    x = gap;
    currentWidth = gap;
    y += rowHeight + gap;
  }

  return canvas.composite(composites);
};

const splitIntoRows = async (images, canvasWidth, gap) => {
  const rows = [];
  let currentRow = [];
  let currentWidth = gap;

  for (const im of images) {
    const meta = await im.metadata();

    currentWidth += meta.width + gap;
    currentRow.push(im);

    if (currentWidth >= canvasWidth) {
      rows.push(currentRow.slice());
      currentWidth = gap;
      currentRow.length = 0;
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  return rows;
};

const scaleImagesToHeight = async (images, targetHeight) => {
  const scaledImages = await Promise.all(
    images.map(async (image) => {
      const meta = await image.metadata();

      // Calculate targetWidth based on target height
      const f = targetHeight / meta.height;
      const targetWidth = Math.floor(meta.width * f);

      // Scale and finalize image
      const buffer = await image.resize(targetWidth, targetHeight).toBuffer();
      return sharp(buffer);
    })
  );

  return scaledImages;
};
