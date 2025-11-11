import { Jimp } from 'jimp';

export const useAdaptiveMode = (images, columns, canvasWidth) => {
  const { avgWidth, avgHeight } = getAvgImageSize(images);
  const maxWidth = canvasWidth || avgWidth * columns;

  resizeImages(images, avgHeight);
  const rows = divideIntoOverflowingRows(images, maxWidth);
  const canvas = layRowsInGrid(rows, maxWidth, avgHeight);
  canvas.write('x.jpg');
};

const layRowsInGrid = (rows, maxWidth, rowHeight, gap = 50) => {
  const canvasHeight = rows.length * rowHeight + (rows.length + 1) * gap;

  const canvas = new Jimp({ width: maxWidth, height: canvasHeight, color: 0x00000000 });

  let x = gap;
  let y = gap;
  let currentWidth = gap;

  for (const row of rows) {
    for (const image of row) {
      currentWidth += image.width + gap;

      if (currentWidth >= maxWidth) {
        cropImageToFitCanvas(image, maxWidth, x, gap);
      }

      canvas.composite(image, x, y);
      x += image.width + gap;
    }
    x = gap;
    y += rowHeight + gap;
    currentWidth = gap;
  }

  return canvas;
};

const cropImageToFitCanvas = (image, maxWidth, currentX, gap) => {
  // The farthest we can go before hitting the right canvas edge
  const usableWidth = maxWidth - gap;

  // How much of the image would go beyond the canvas
  const overflow = currentX + image.width - usableWidth;

  // Only crop if image overflows
  if (overflow > 0) {
    const cropWidth = image.width - overflow;
    image.crop({ x: 0, y: 0, w: cropWidth, h: image.height });
  }
};

const resizeImages = (images, height) => {
  for (const image of images) {
    const factor = height / image.height;
    image.scale(factor);
  }
};

const divideIntoOverflowingRows = (images, maxWidth, gap = 50) => {
  const rows = [];
  let row = [];
  let currentWidth = gap;

  for (let i = 0; i < images.length; i++) {
    const image = images[i];

    currentWidth += image.width + gap;
    row.push(image);

    // If the max width is reached, add row to rows and reset
    if (currentWidth + gap >= maxWidth || i === images.length - 1) {
      rows.push(row.slice());
      row.length = 0;
      currentWidth = gap;
    }
  }

  return rows;
};

const divideIntoFitRows = (images, maxWidth, gap = 50) => {
  const rows = [];
  let row = [];
  let currentWidth = gap; // start with one gap on the left

  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const nextWidth = currentWidth + image.width + gap; // gap before + image + gap after

    // If this image would exceed the maxWidth, start a new row
    if (nextWidth > maxWidth && row.length > 0) {
      rows.push(row);
      row = [];
      currentWidth = gap; // reset, new row starts with one gap
    }

    row.push(image);
    currentWidth += image.width + gap; // move cursor forward
  }

  // Push the last row if it has any images
  if (row.length > 0) {
    rows.push(row);
  }

  return rows;
};

const getAvgImageSize = (images) => {
  const totalWidth = images.reduce((acc, image) => acc + image.width, 0);
  const totalHeight = images.reduce((acc, image) => acc + image.height, 0);
  const avgWidth = Math.round(totalWidth / images.length);
  const avgHeight = Math.round(totalHeight / images.length);

  return { avgWidth, avgHeight };
};
