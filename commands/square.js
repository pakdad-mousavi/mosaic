import { Command } from 'commander';
import { addSharedOptions, handleError, writeImage } from '../lib/helpers/utils.js';
import { validateSharedOptions, validateSquareOptions } from '../lib/helpers/validations.js';
import { loadImages } from '../lib/helpers/loadImages.js';
import { squareMerge } from '../lib/merges/square-merge/index.js';

const squareCommand = new Command('square');

squareCommand
  .description('Use a uniform grid layout (all images same size)')
  .option('-m, --fit-mode <contain|cover>', 'Determines how to fit the images in their cells', 'contain')
  .option('--is, --image-size <px>', 'The width and height of each image, defaults to the smallest image', null)
  .option('-p, --padding-color <hex|transparent>', 'Image padding color', 'transparent')
  .option('-c, --columns <n>', 'The number of columns', 4)
  .option('--caption', 'Whether to caption each image', false)
  .option('--caption-color <hex|transparent>', 'Image caption color', '#000000')
  .action(async (files, opts) => {
    await main(files, opts);
  });

const main = async (files, opts) => {
  // Collect and validate parameters
  try {
    const validatedParams = getValidatedParams(files, opts);
    console.log(validatedParams);

    // Load images, create grid, and write grid on disk
    await generateAndSaveGrid(validatedParams);

    // Output success message
  } catch (e) {
    handleError(e);
  }
};

const getValidatedParams = (files, opts) => {
  const params = { files, ...opts };
  const sharedOptions = validateSharedOptions(params);
  const commandOptions = validateSquareOptions(sharedOptions, params);
  return { ...sharedOptions, ...commandOptions };
};

const generateAndSaveGrid = async (validatedParams) => {
  const images = await loadImages(validatedParams);
  const grid = await squareMerge(images, validatedParams);
  writeImage(grid, validatedParams.output);
};

addSharedOptions(squareCommand);
export default squareCommand;
