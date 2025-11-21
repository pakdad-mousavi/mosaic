import { Command } from 'commander';
import { addSharedOptions, getValidatedParams, handleError, writeImage } from '../lib/helpers/utils.js';
import { validateAspectOptions } from '../lib/helpers/validations.js';
import { loadImages } from '../lib/helpers/loadImages.js';
import { aspectMerge } from '../lib/merges/aspect-merge/index.js';

const aspectCommand = new Command('aspect');

aspectCommand
  .description('Same aspect ratio, but not necessarily 1:1')
  .option('--ar, --aspect-ratio <width/height|number>', 'The aspect ratio of all the images (examples: 16/9, 4:3, 1.777)', null)
  .option('-w, --image-width <px>', 'The width of each image, defaults to the smallest image', null)
  .option('-c, --columns <n>', 'The number of columns', 4)
  .option('--ca, --caption', 'Whether to caption each image', false)
  .option('--cc, --caption-color <hex>', 'Image Caption color', '#000000')
  .option('--mcs, --max-caption-size <pt>', 'The maximum allowed caption size', 100)
  .action(async (files, opts) => {
    await main(files, opts);
  });

const main = async (files, opts) => {
  // Collect and validate parameters
  try {
    const validatedParams = getValidatedParams(files, opts, validateAspectOptions);
    console.log(validatedParams);

    // Load images, create grid, and write grid on disk
    await generateAndSaveGrid(validatedParams);

    // Output success message
  } catch (e) {
    handleError(e);
  }
};

const generateAndSaveGrid = async (validatedParams) => {
  const { files, images } = await loadImages(validatedParams);
  const grid = await aspectMerge(files, images, validatedParams);
  await writeImage(grid, validatedParams.output);
};

addSharedOptions(aspectCommand);
export default aspectCommand;
