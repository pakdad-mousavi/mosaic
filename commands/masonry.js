import { Command } from 'commander';
import { addSharedOptions, getValidatedParams, handleError, writeImage } from '../lib/helpers/utils.js';
import { validateMasonryOptions } from '../lib/helpers/validations.js';
import { loadImages } from '../lib/helpers/loadImages.js';
import { masonryMerge } from '../lib/merges/masonry-merge/index.js';

const masonryCommand = new Command('masonry');

masonryCommand
  .description("Use a ragged-grid layout, preserves images' aspect ratios")
  .option('--rh, --row-height <px>', 'The height of each row, defaults to the smallest image height', null)
  .option('--cw, --column-width <px>', 'The width of each column, defaults to the smallest image width', null)
  .option('--cvw, --canvas-width <px>', 'The width of the canvas', null)
  .option('--cvh, --canvas-height <px>', 'The height of the canvas', null)
  .option('--or, --orientation <horizontal|vertical>', 'The orientation of the masonry layout', 'horizontal')
  .option('--ha, --h-align <left|center|right|justified>', 'Horizontal alignment of the grid (for horizontal orientations)', null)
  .option('--va, --v-align <top|middle|bottom|justified>', 'Vertical alignment of the grid (for vertical orientations)', null)
  .action((files, opts) => {
    main(files, opts);
  });

const main = async (files, opts) => {
  try {
    // Collect and validate parameters
    const validatedParams = getValidatedParams(files, opts, validateMasonryOptions);
    console.log(validatedParams);

    // Load images, create grid, and write grid on disk
    generateAndSaveGrid(validatedParams);

    // Output success message
  } catch (e) {
    handleError(e);
  }
};

const generateAndSaveGrid = async (validatedParams) => {
  const images = await loadImages(validatedParams);
  const grid = await masonryMerge(images, validatedParams);
  writeImage(grid, validatedParams.output);
};

addSharedOptions(masonryCommand);
export default masonryCommand;
