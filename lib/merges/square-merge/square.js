import { Jimp } from 'jimp';

export const squareMerge = (
  images,
  { gap, canvasColor, output, fitMode, imageSize, paddingColor, columns, caption, captionColor }
) => {
  // Calculate new image size and convert images to squares
  const newImageSize = Number(imageSize) || getSmallestImageSize(images);
  const normalizedImages = normalizeImages(images, paddingColor, newImageSize, fitMode);

  // Lay images in a grid
  const grid = layImagesInGrid(normalizedImages, columns, newImageSize, gap, canvasColor);
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

const normalizeImages = (images, paddingColor, targetSize, fitMode) => {
  switch (fitMode) {
    // Change the image to a square by adding padding to its left and right / top and bottom.
    case 'contain':
      const normalizedImages = convertImagesToSquares(images, paddingColor);
      resizeImages(normalizedImages, targetSize);
      return normalizedImages;
    // Change the image to a square by zooming in the center until it covers the entire target size.
    case 'cover':
      rescaleImages(images, targetSize);
      cropToCoverImages(images, targetSize);
      return images;
  }
};

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

const rescaleImages = (images, targetSize) => {
  for (const image of images) {
    // Only rescale image if the smallest side is smaller than the target size
    const smallerSide = Math.min(image.width, image.height);
    if (smallerSide >= targetSize) {
      continue;
    }

    // Scale the smaller side of the image to be equal to the target size
    const factor = targetSize / smallerSide;
    image.scale({ f: factor });
  }
};

const cropToCoverImages = (images, targetSize) => {
  for (const image of images) {
    // Only crop images if one side is larger than target size
    if (image.width === targetSize && image.height === targetSize) continue;

    // Find out which side is longer
    const longerSide = Math.max(image.width, image.height);
    const isLongerSideWidth = longerSide === image.width;

    // Calculate crop offset
    const cropOffset = isLongerSideWidth
      ? Math.round((image.width - targetSize) / 2)
      : Math.round((image.height - targetSize) / 2);

    // Crop image respectively
    isLongerSideWidth
      ? image.crop({ x: cropOffset, y: 0, w: targetSize, h: image.height })
      : image.crop({ x: 0, y: cropOffset, w: image.width, h: targetSize });
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
