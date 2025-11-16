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
