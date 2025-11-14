import { Command } from 'commander';
import { addSharedOptions, writeImage } from '../lib/helpers/utils.js';
import { validateSharedOptions, validateMasonryOptions } from '../lib/helpers/validations.js';
import { loadImages } from '../lib/helpers/loadImages.js';
import { masonryMerge } from '../lib/merges/masonry-merge/index.js';

const masonryCommand = new Command('masonry');

masonryCommand
  .description("Use a ragged-grid layout, preserves images' aspect ratios")
  .option('--rh, --row-height <px>', 'The height of each row, defaults to the smallest image height', null)
  .option('--cw, --column-width <px>', 'The width of each column, defaults to the smallest image width', null)
  .option('-R, --rows <n>', 'The number of rows', null)
  .option('-c, --columns <n>', 'The number of columns', null)
  .option('--or, --orientation <horizontal|vertical>', 'The orientation of the masonry layout', 'horizontal')
  .option('--ha, --h-align <left|center|right|justified>', 'Horizontal alignment of the grid (for horizontal orientations)', null)
  .option('--va, --v-align <top|middle|bottom|justified>', 'Vertical alignment of the grid (for vertical orientations)', null)
  .action((files, opts) => {
    main(files, opts);
  });

const main = async (files, opts) => {
  // Collect and validate parameters
  const validatedParams = getValidatedParams(files, opts);
  console.log(validatedParams);

  // Load images, create grid, and write grid on disk
  generateAndSaveGrid(validatedParams);

  // Output success message
};

const getValidatedParams = (files, opts) => {
  const params = { files, ...opts };
  const sharedOptions = validateSharedOptions(params);
  const commandOptions = validateMasonryOptions(params);
  return { ...sharedOptions, ...commandOptions };
};

const generateAndSaveGrid = async (validatedParams) => {
  const images = await loadImages(validatedParams);
  const grid = masonryMerge(images, validatedParams);
  // writeImage(grid, validatedParams.output);
};

addSharedOptions(masonryCommand);
export default masonryCommand;
