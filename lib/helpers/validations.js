import { displayWarningMessage, isSupportedImage, isValidHexadecimal, SUPPORTED_IMAGES } from './utils.js';

export const validateSharedOptions = ({ files, dir, recursive, shuffle, gap, canvasColor, output }) => {
  if ((!files || !files.length) && !dir) {
    throw new Error('You must specify either [files...] or --dir');
  }

  if (isNaN(gap) || !Number.isInteger(Number(gap)) || gap < 0) {
    throw new Error('--gap must be a positive integer');
  }

  if (canvasColor !== 'transparent' && !isValidHexadecimal(canvasColor)) {
    throw new Error('--canvas-color must be a valid hexadecimal value');
  }

  if (!isSupportedImage(output)) {
    throw new Error('Invalid output format. Choose one of the following: ' + SUPPORTED_IMAGES.join(', '));
  }

  const formattedParams = {
    files: files || [],
    dir,
    recursive,
    shuffle,
    gap: Number(gap),
    canvasColor: canvasColor === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : canvasColor,
    output,
  };

  return formattedParams;
};

export const validateSquareOptions = ({ fitMode, imageSize, paddingColor, columns, caption, captionColor }) => {
  // Define fit modes for validation
  const FIT_MODES = ['contain', 'cover'];

  if (!FIT_MODES.includes(fitMode)) {
    throw new Error('Invalid fit mode. Choose one of the following: ' + FIT_MODES.join(', '));
  }

  if (imageSize && (isNaN(imageSize) || !Number.isInteger(Number(imageSize)) || Number(imageSize) < 1)) {
    throw new Error('--image-size must be a positive integer.');
  }

  if (paddingColor !== 'transparent' && !isValidHexadecimal(paddingColor)) {
    throw new Error('--padding-color must be a valid hexadecimal value');
  }

  if (isNaN(columns) || !Number.isInteger(Number(columns)) || Number(columns) < 1) {
    throw new Error('--columns must be a positive integer');
  }

  if (captionColor !== 'transparent' && !isValidHexadecimal(captionColor)) {
    throw new Error('--caption-color must be a valid hexadecimal value');
  }

  const formattedParams = {
    fitMode,
    imageSize: Number(imageSize) || null,
    paddingColor: paddingColor === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : paddingColor,
    columns: Number(columns),
    caption,
    captionColor: captionColor === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : captionColor,
  };

  return formattedParams;
};

export const validateMasonryOptions = ({ rowHeight, columnWidth, canvasWidth, canvasHeight, orientation, hAlign, vAlign }) => {
  // Define orientations and alignments for validation
  const ORIENTATIONS = ['horizontal', 'vertical'];
  const HORIZONTAL_ALIGNMENTS = ['left', 'center', 'right', 'justified'];
  const VERTICAL_ALIGNMENTS = ['top', 'middle', 'bottom', 'justified'];

  // Define orientation dependent options which are ignored if defined for the wrong orientation
  const IGNORED_ORIENTATION_DEPENDENT_OPTIONS = {
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
  if (!ORIENTATIONS.includes(orientation)) {
    throw new Error('Invalid orientation. Choose one of the following: ' + ORIENTATIONS.join(', '));
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

  // Ensure canvas width is given and is a positive integer
  if (orientation === 'horizontal' && !canvasWidth) {
    throw new Error('--canvas-width must be given.');
  } else if (
    orientation === 'horizontal' &&
    (isNaN(canvasWidth) || !Number.isInteger(Number(canvasWidth)) || Number(canvasWidth) < 1)
  ) {
    throw new Error('--canvas-width must be a positive integer.');
  }

  // Ensure canvas height is given and is a positive integer
  if (orientation === 'vertical' && !canvasHeight) {
    throw new Error('--canvas-height must be given.');
  } else if (
    orientation === 'vertical' &&
    (isNaN(canvasHeight) || !Number.isInteger(Number(canvasHeight)) || Number(canvasHeight) < 1)
  ) {
    throw new Error('--canvas-height must be a positive integer.');
  }

  // Validate dependent options by showing warnings when incorrect parameters
  // are used with incorrect orientation
  const ignoredOrientationOptions = IGNORED_ORIENTATION_DEPENDENT_OPTIONS[orientation];
  for (const { option, value } of ignoredOrientationOptions) {
    if (value) {
      displayWarningMessage(`"${option}" option is ignored due to ${orientation} orientation.`);
    }
  }

  const params = {
    rowHeight: Number(rowHeight) || null,
    columnWidth: Number(columnWidth) || null,
    canvasHeight: Number(canvasHeight) || null,
    canvasWidth: Number(canvasWidth) || null,
    orientation,
    hAlign,
    vAlign,
  };

  return params;
};
