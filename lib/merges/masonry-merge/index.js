import { calculateAvgColumnWidth, calculateAvgRowHeight } from './utils.js';
import { buildHorizontalMasonry } from './horizontal.js';
import { buildVerticalMasonry } from './vertical.js';

const ORIENTATION_DEFAULTS = {
  horizontal: {
    needed: ['canvasWidth', 'rowHeight', 'hAlign'],
    defaults: {
      rowHeight: calculateAvgRowHeight,
      hAlign: () => 'justified',
    },
  },
  vertical: {
    needed: ['canvasHeight', 'columnWidth', 'vAlign'],
    defaults: {
      columnWidth: calculateAvgColumnWidth,
      vAlign: () => 'justified',
    },
  },
};

export const masonryMerge = async (images, opts) => {
  const { orientation } = opts;
  const params = await getOrientationSpecificParams(images, opts);

  return await generateGrid(orientation, images, params);
};

const getOrientationSpecificParams = async (images, currentParams) => {
  const { orientation, gap, canvasColor } = currentParams;
  const config = ORIENTATION_DEFAULTS[orientation];

  const output = { gap, canvasColor };

  for (const key of config.needed) {
    if (currentParams[key] != null) {
      output[key] = currentParams[key];
    }
  }

  // Assign static defaults
  for (const [key, getter] of Object.entries(config.defaults)) {
    if (output[key] == null) {
      output[key] = await getter(images);
    }
  }

  return output;
};

const generateGrid = async (orientation, images, params) => {
  if (orientation === 'horizontal') {
    return await buildHorizontalMasonry(images, params);
  } else {
    return buildVerticalMasonry(images, params);
  }
};
