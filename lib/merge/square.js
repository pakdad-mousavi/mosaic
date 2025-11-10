import { Jimp } from 'jimp';

export const useSquaredMode = async (images, columns, size) => {
  const newImageSize = getNewImageSize(images, size);

  const squaredImages = convertImagesToSquares(images);
  await resizeImages(squaredImages, newImageSize);
  const canvas = layImagesInGrid(squaredImages, columns, newImageSize);
  canvas.write('test.jpg');
};

const layImagesInGrid = (images, columns, size, gap = 50) => {
  const rows = Math.ceil(images.length / columns);

  // Calculate canvas width and height
  const canvasWidth = columns * size + (columns + 1) * gap;
  const canvasHeight = rows * size + (rows + 1) * gap;

  // Create canvas
  const canvas = new Jimp({ width: canvasWidth, height: canvasHeight, color: 0xffffffff });

  // Lay images in the canvas
  let x = gap;
  let y = gap;

  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      // Get the current index
      const curIdx = col * columns + row;
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

const convertImagesToSquares = (images) => {
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

    const newImage = new Jimp({ width: longerSide, height: longerSide, color: 0xffffffff });
    const gap = Math.round((longerSide - shorterSide) / 2);

    isLongerSideWidth ? newImage.composite(image, 0, gap) : newImage.composite(image, gap, 0);
    squaredImages.push(newImage);
  }

  return squaredImages;
};

const getNewImageSize = (images, size) => {
  return Number(size) || getSmallestImageSize(images);
};

const resizeImages = async (images, size) => {
  for (const image of images) {
    image.resize({ w: size, h: size });
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
