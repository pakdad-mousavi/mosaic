import fs from 'node:fs/promises';

import {
  displayWarningMessage,
  handleError,
  isSupportedOutputImage,
  isValidHexadecimal,
  parseAspectRatio,
  SUPPORTED_OUTPUT_FORMATS,
} from '../../../lib/helpers/utils.js';

export const validateSharedOptions = async (sharedOptions) => {
  // Extract params
  const { files, dir, recursive, shuffle, arc, gap, canvasColor, output } = sharedOptions;

  // Conduct validations
  if ((!files || !files.length) && !dir) {
    throw new Error('You must specify either [files...] or --dir.');
  }

  // Ensure dir is a valid dir path
  if (dir.length) {
    let stats;

    try {
      stats = await fs.stat(dir);
    } catch (e) {
      throw new Error('Path does not exist.');
    }

    if (!stats.isDirectory()) {
      throw new Error('Path is not a directory.');
    }
  }

  if (isNaN(gap) || !Number.isInteger(Number(gap)) || gap < 0) {
    throw new Error('--gap must be a positive integer.');
  }

  if (isNaN(arc) || !Number.isInteger(Number(arc)) || arc < 0) {
    throw new Error('--arc must be a positive integer.');
  }

  if (canvasColor !== 'transparent' && !isValidHexadecimal(canvasColor)) {
    throw new Error('--canvas-color must be a valid hexadecimal value.');
  }

  if (!isSupportedOutputImage(output)) {
    throw new Error('Invalid output format. Choose one of the following: ' + SUPPORTED_OUTPUT_FORMATS.join(', '));
  }

  const formattedParams = {
    files: files || [],
    dir,
    recursive,
    shuffle,
    arc: Number(arc),
    gap: Number(gap),
    canvasColor: canvasColor === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : canvasColor,
    output,
  };

  return formattedParams;
};

export const validateMasonryOptions = (sharedOptions, masonryOptions) => {
  // Extract params
  const { gap } = sharedOptions;
  const { rowHeight, columnWidth, canvasWidth, canvasHeight, flow, hAlign, vAlign } = masonryOptions;

  // Define orientations and alignments for validation
  const FLOWS = ['horizontal', 'vertical'];
  const HORIZONTAL_ALIGNMENTS = ['left', 'center', 'right', 'justified'];
  const VERTICAL_ALIGNMENTS = ['top', 'middle', 'bottom', 'justified'];

  // Define orientation dependent options which are ignored if defined for the wrong orientation
  const IGNORED_FLOW_DEPENDENT_OPTIONS = {
    horizontal: [
      {
        option: '--v-align',
        value: vAlign,
      },
      {
        option: '--canvas-height',
        value: canvasHeight,
      },
      {
        option: '--column-width',
        value: columnWidth,
      },
    ],
    vertical: [
      {
        option: '--h-align',
        value: hAlign,
      },
      {
        option: '--canvas-width',
        value: canvasWidth,
      },
      {
        option: '--row-height',
        value: rowHeight,
      },
    ],
  };

  // Validate orientations and alignments
  if (!FLOWS.includes(flow)) {
    throw new Error('Invalid orientation. Choose one of the following: ' + FLOWS.join(', '));
  }

  if (hAlign && !HORIZONTAL_ALIGNMENTS.includes(hAlign)) {
    throw new Error('Invalid horizontal alignment. Choose one of the following: ' + HORIZONTAL_ALIGNMENTS.join(', '));
  }

  if (vAlign && !VERTICAL_ALIGNMENTS.includes(vAlign)) {
    throw new Error('Invalid vertical orientation. Choose one of the following: ' + VERTICAL_ALIGNMENTS.join(', '));
  }

  // Ensure numeric values are positive integers
  if (rowHeight && (isNaN(rowHeight) || !Number.isInteger(Number(rowHeight)) || Number(rowHeight) < 1)) {
    throw new Error('--row-height must be a positive integer.');
  }

  if (columnWidth && (isNaN(columnWidth) || !Number.isInteger(Number(columnWidth)) || Number(columnWidth) < 1)) {
    throw new Error('--column-width must be a positive integer.');
  }

  // Ensure canvas width is given
  if (flow === 'horizontal' && !canvasWidth) {
    throw new Error('--canvas-width must be given.');
  }
  // and is a positive integer
  else if (flow === 'horizontal' && (isNaN(canvasWidth) || !Number.isInteger(Number(canvasWidth)) || Number(canvasWidth) < 1)) {
    throw new Error('--canvas-width must be a positive integer.');
  }
  // and it accomodates for the minimum width needed
  else if (flow === 'horizontal' && canvasWidth <= gap * 2) {
    throw new Error(`--canvas-width must be greater than 2 gaps or ${gap * 2}px.`);
  }

  // Ensure canvas height is given
  if (flow === 'vertical' && !canvasHeight) {
    throw new Error('--canvas-height must be given.');
  }
  // and is a positive integer
  else if (flow === 'vertical' && (isNaN(canvasHeight) || !Number.isInteger(Number(canvasHeight)) || Number(canvasHeight) < 1)) {
    throw new Error('--canvas-height must be a positive integer.');
  }
  // and it accomodates for the minimum height needed
  else if (flow === 'vertical' && canvasHeight <= gap * 2) {
    throw new Error(`--canvas-height must be greater than 2 gaps or ${gap * 2}px.`);
  }

  // Validate dependent options by showing warnings when incorrect parameters
  // are used with incorrect orientation
  const ignoredFlowOptions = IGNORED_FLOW_DEPENDENT_OPTIONS[flow];
  for (const { option, value } of ignoredFlowOptions) {
    if (value) {
      displayWarningMessage(`"${option}" option is ignored due to ${flow} flow.`);
    }
  }

  const params = {
    rowHeight: Number(rowHeight) || null,
    columnWidth: Number(columnWidth) || null,
    canvasHeight: Number(canvasHeight) || null,
    canvasWidth: Number(canvasWidth) || null,
    flow,
    hAlign,
    vAlign,
  };

  return params;
};

export const validateGridOptions = (sharedOptions, gridOptions) => {
  // Extract params
  const { aspectRatio, imageWidth, columns, caption, captionColor, maxCaptionSize } = gridOptions;

  // Ensure aspect ratio is valid
  const parsedAspectRatio = parseAspectRatio(aspectRatio);
  if (!parsedAspectRatio) {
    throw new Error('--aspect-ratio must be a valid ratio. Examples: 16/9, 2:3, 1x2, 1.77');
  }

  if (imageWidth && (isNaN(imageWidth) || !Number.isInteger(Number(imageWidth)) || Number(imageWidth) < 1)) {
    throw new Error('--image-width must be a positive integer.');
  }

  if (isNaN(columns) || !Number.isInteger(Number(columns)) || Number(columns) < 1) {
    throw new Error('--columns must be a positive integer.');
  }

  if (isNaN(maxCaptionSize) || !Number.isInteger(Number(maxCaptionSize)) || Number(maxCaptionSize) < 2) {
    throw new Error('--max-caption-size must be a positive integer >= 2 (minimum caption size).');
  }

  if (!isValidHexadecimal(captionColor)) {
    throw new Error('--caption-color must be a valid hexadecimal value.');
  }

  const formattedParams = {
    aspectRatio: parsedAspectRatio,
    imageWidth: Number(imageWidth) || null,
    columns: Number(columns),
    caption,
    captionColor,
    maxCaptionSize,
  };

  return formattedParams;
};
