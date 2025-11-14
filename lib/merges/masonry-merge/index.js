import { Jimp } from 'jimp';
import { estimateGridDimension, calculateAvgColumnWidth, calculateAvgRowHeight } from './utils.js';
import { buildHorizontalMasonry } from './horizontal.js';
import { buildVerticalMasonry } from './vertical.js';

const ORIENTATION_DEFAULTS = {
  horizontal: {
    needed: ['rows', 'rowHeight', 'hAlign'],
    defaults: {
      hAlign: 'justified',
    },
  },
  vertical: {
    needed: ['columns', 'columnWidth', 'vAlign'],
    defaults: {
      vAlign: 'justified',
    },
  },
};

export const masonryMerge = (images, opts) => {
  const { orientation } = opts;
  const params = getOrientationSpecificParams(images, opts);

  // const grid = generateGrid(orientation, params);
};

const getOrientationSpecificParams = (images, currentParams) => {
  const { orientation } = currentParams;
  const config = ORIENTATION_DEFAULTS[orientation];

  const output = {};

  for (const key of config.needed) {
    if (currentParams[key] != null) {
      output[key] = currentParams[key];
    } else {
      // dynamic defaults (computed later)
      output[key] = computeDynamicDefault(key, images);
    }
  }

  // Assign static defaults
  for (const [key, value] of Object.entries(config.defaults)) {
    if (output[key] == null) {
      output[key] = value;
    }
  }

  return output;
};

const computeDynamicDefault = (key, images) => {
  switch (key) {
    case 'rows':
      return estimateGridDimension(images);
    case 'rowHeight':
      return calculateAvgRowHeight(images);
    case 'columns':
      return estimateGridDimension(images);
    case 'columnWidth':
      return calculateAvgColumnWidth(images);
    default:
      return undefined;
  }
};

const generateGrid = (orientation, params) => {
  if (orientation === 'horizontal') {
    return buildHorizontalMasonry(params);
  } else {
    return buildVerticalMasonry(params);
  }
};
