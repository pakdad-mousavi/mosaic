export const estimateGridDimension = (images) => {
  const midPoint = Math.sqrt(images.length);
  return Math.floor(midPoint);
};

export const calculateAvgRowHeight = (images) => {
  const totalHeight = images.reduce((acc, img) => acc + img.height, 0);
  return Math.floor(totalHeight / images.length);
};

export const calculateAvgColumnWidth = (images) => {
  const totalWidth = images.reduce((acc, img) => acc + img.width, 0);
  return Math.floor(totalWidth / images.length);
};
