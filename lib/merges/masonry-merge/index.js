import { calculateAvgWidth, calculateAvgHeight } from '../merge-utils.js';
import { buildHorizontalMasonry } from './horizontal.js';
import { buildVerticalMasonry } from './vertical.js';

const FLOW_DEFAULTS = {
  horizontal: {
    needed: ['canvasWidth', 'rowHeight', 'hAlign'],
    defaults: {
      rowHeight: calculateAvgHeight,
      hAlign: () => 'justified',
    },
  },
  vertical: {
    needed: ['canvasHeight', 'columnWidth', 'vAlign'],
    defaults: {
      columnWidth: calculateAvgWidth,
      vAlign: () => 'justified',
    },
  },
};

export const masonryMerge = async (images, opts) => {
  const { flow } = opts;
  const params = await getFlowSpecificParams(images, opts);

  return await generateGrid(flow, images, params);
};

const getFlowSpecificParams = async (images, currentParams) => {
  const { flow, gap, canvasColor } = currentParams;
  const config = FLOW_DEFAULTS[flow];

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

const generateGrid = async (flow, images, params) => {
  if (flow === 'horizontal') {
    return await buildHorizontalMasonry(images, params);
  } else {
    return buildVerticalMasonry(images, params);
  }
};
