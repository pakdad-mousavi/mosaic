import { Jimp } from 'jimp';

export const squareMerge = (
  images,
  { gap, canvasColor, output, fitMode, imageSize, paddingColor, columns, caption, captionColor }
) => {
  // Calculate new image size and convert images to squares
  const newImageSize = Number(imageSize) || getSmallestImageSize(images);
  const squaredImages = convertImagesToSquares(images, paddingColor);

  // Resize images to target size
  resizeImages(squaredImages, newImageSize);

  // Lay images in a grid
  const grid = layImagesInGrid(squaredImages, columns, newImageSize, gap, canvasColor);
  return grid;
};

const layImagesInGrid = (images, columns, size, gap, canvasColor) => {
  const rows = Math.ceil(images.length / columns);

  // Calculate canvas width and height
  const canvasWidth = columns * size + (columns + 1) * gap;
  const canvasHeight = rows * size + (rows + 1) * gap;

  // Create canvas
  const canvas = new Jimp({ width: canvasWidth, height: canvasHeight, color: canvasColor });

  // Lay images in the canvas
  let x = gap;
  let y = gap;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      // Get the current index
      const curIdx = row * columns + col;
      if (curIdx > images.length - 1) break;

      // Add image to canvas and update x pos
      canvas.composite(images[curIdx], x, y);
      x += size + gap;
    }
    // Update y pos and reset x pos
    x = gap;
    y += size + gap;
  }

  return canvas;
};

// ADD FIT MODE
const convertImagesToSquares = (images, paddingColor) => {
  const squaredImages = [];

  for (const image of images) {
    // skip if already a square
    if (image.width === image.height) {
      squaredImages.push(image);
      continue;
    }

    // Change to square
    const longerSide = image.width > image.height ? image.width : image.height;
    const shorterSide = image.width > image.height ? image.height : image.width;
    const isLongerSideWidth = image.width > image.height;

    const newImage = new Jimp({ width: longerSide, height: longerSide, color: paddingColor });
    const gap = Math.round((longerSide - shorterSide) / 2);

    isLongerSideWidth ? newImage.composite(image, 0, gap) : newImage.composite(image, gap, 0);
    squaredImages.push(newImage);
  }

  return squaredImages;
};

const resizeImages = (images, targetSize) => {
  for (const image of images) {
    image.resize({ w: targetSize, h: targetSize });
  }
};

const getSmallestImageSize = (images) => {
  let smallest = Infinity;
  for (const image of images) {
    if (image.width < smallest) {
      smallest = image.width;
    }
  }

  return smallest;
};
