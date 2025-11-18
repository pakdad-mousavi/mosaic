import sharp from 'sharp';

export const calculateAvgRowHeight = async (images) => {
  let totalHeight = 0;

  for (const img of images) {
    const meta = await img.metadata();
    totalHeight += meta.height;
  }

  return Math.floor(totalHeight / images.length);
};

export const calculateAvgColumnWidth = async (images) => {
  let totalWidth = 0;

  for (const img of images) {
    const meta = await img.metadata();
    totalWidth += meta.width;
  }

  return Math.floor(totalWidth / images.length);
};

export const scaleImages = async (images, { width = null, height = null }) => {
  if (!width && !height) {
    throw new Error('You must provide either width or height.');
  }

  const scaledImages = await Promise.all(
    images.map(async (image) => {
      const meta = await image.metadata();

      let targetWidth, targetHeight;

      if (width) {
        const f = width / meta.width;
        targetWidth = width;
        targetHeight = Math.floor(meta.height * f);
      } else {
        const f = height / meta.height;
        targetHeight = height;
        targetWidth = Math.floor(meta.width * f);
      }

      const buffer = await image.resize(targetWidth, targetHeight).toBuffer();

      return sharp(buffer);
    })
  );

  return scaledImages;
};
