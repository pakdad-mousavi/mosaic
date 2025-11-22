import { Command } from 'commander';
import chalk from 'chalk';
import {
  addSharedOptions,
  cliConfirm,
  displayInfoMessage,
  displaySuccessMessage,
  displayWarningMessage,
  getValidatedParams,
  handleError,
  writeImage,
} from '../lib/helpers/utils.js';
import { validateSquareOptions } from '../lib/helpers/validations.js';
import { loadImages } from '../lib/helpers/loadImages.js';
import { squareMerge } from '../lib/merges/square-merge/index.js';

const squareCommand = new Command('square');

squareCommand
  .description('Use a uniform grid layout (all images are 1:1)')
  .option('-m, --fit-mode <contain|cover>', 'Determines how to fit the images in their cells', 'contain')
  .option('--is, --image-size <px>', 'The width and height of each image, defaults to the smallest image', null)
  .option('-p, --padding-color <hex|transparent>', 'Image padding color', 'transparent')
  .option('-c, --columns <n>', 'The number of columns', 4)
  .option('--ca, --caption', 'Whether to caption each image', false)
  .option('--cc, --caption-color <hex>', 'Caption color', '#000000')
  .option('--mcs, --max-caption-size <pt>', 'The maximum allowed caption size', 100)
  .action(async (files, opts) => {
    await main(files, opts);
  });

const main = async (files, opts) => {
  // Collect and validate parameters
  try {
    const validatedParams = getValidatedParams(files, opts, validateSquareOptions);
    // console.log(validatedParams);

    // Load images, create grid, and write grid on disk
    await generateAndSaveGrid(validatedParams);

    // Output success message
  } catch (e) {
    handleError(e);
  }
};

const generateAndSaveGrid = async (validatedParams) => {
  const { files, images, ignoredFiles } = await loadImages(validatedParams);

  // Display warnings if needed
  if (ignoredFiles.length) {
    displayWarningMessage('\nThese files will be ignored due to unsupported formats:');
    for (const file of ignoredFiles) {
      displayInfoMessage(file);
    }

    const confirmation = await cliConfirm('\nAre you sure you want to continue?');
    if (!confirmation) return;
  }

  const grid = await squareMerge(files, images, validatedParams);
  const success = await writeImage(grid, validatedParams.output);

  // Display success message
  if (success) {
    displaySuccessMessage(`\nImage has been created successfully: ${chalk.bold(validatedParams.output)}\n`);
  }
};

addSharedOptions(squareCommand);
export default squareCommand;
