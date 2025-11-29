import { Command } from 'commander';
import chalk from 'chalk';
import {
  cliConfirm,
  displayInfoMessage,
  displaySuccessMessage,
  displayWarningMessage,
  handleError,
  writeImage,
} from '../../lib/helpers/utils.js';
import { addSharedOptions, getValidatedParams } from './helpers/utils.js';
import { validateMasonryOptions } from './helpers/validations.js';
import { loadImages } from '../../lib/helpers/loadImages.js';
import { masonryMerge } from '../../lib/merges/masonry-merge/index.js';

const masonryCommand = new Command('masonry');

masonryCommand
  .description("Use a ragged-grid layout, preserves images' aspect ratios")
  .option('--rh, --row-height <px>', 'The height of each row, defaults to the smallest image height', null)
  .option('--cw, --column-width <px>', 'The width of each column, defaults to the smallest image width', null)
  .option('--cvw, --canvas-width <px>', 'The width of the canvas', null)
  .option('--cvh, --canvas-height <px>', 'The height of the canvas', null)
  .option('-f, --flow <horizontal|vertical>', 'The flow of the masonry layout', 'horizontal')
  .option('--ha, --h-align <left|center|right|justified>', 'Horizontal alignment of the grid (for horizontal flows)', null)
  .option('--va, --v-align <top|middle|bottom|justified>', 'Vertical alignment of the grid (for vertical flows)', null)
  .action((files, opts) => {
    main(files, opts);
  });

const main = async (files, opts) => {
  try {
    // Collect and validate parameters
    const validatedParams = getValidatedParams(files, opts, validateMasonryOptions);

    // Load images, create grid, and write grid on disk
    generateAndSaveGrid(validatedParams);

    // Output success message
  } catch (e) {
    handleError(e);
  }
};

const generateAndSaveGrid = async (validatedParams) => {
  const { images, ignoredFiles } = await loadImages(validatedParams);

  // Display warnings if needed
  if (ignoredFiles.length) {
    displayWarningMessage('\nThese files will be ignored due to unsupported formats:');
    for (const file of ignoredFiles) {
      displayInfoMessage(file);
    }

    const confirmation = await cliConfirm('\nAre you sure you want to continue?');
    if (!confirmation) return;
  }

  const grid = await masonryMerge(images, validatedParams);
  const success = await writeImage(grid, validatedParams.output);

  // Display success message
  if (success) {
    displaySuccessMessage(`\nImage has been created successfully: ${chalk.bold(validatedParams.output)}\n`);
  }
};

addSharedOptions(masonryCommand);
export default masonryCommand;
