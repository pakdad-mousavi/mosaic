import { Command } from 'commander';
import { addSharedOptions } from '../lib/utils.js';
import { validateSharedOptions, validateSquareOptions } from '../lib/validations.js';

const squareCommand = new Command('square');

squareCommand
  .description('Use a uniform grid layout (all images same size)')
  .option('-m, --fit-mode <contain|cover>', 'Determines how to fit the images in their cells', 'contain')
  .option('--is, --image-size <px>', 'The width and height of each image, defaults to the smallest image', null)
  .option('-p, --padding-color <hex|transparent>', 'Image padding color', '#ffffff')
  .option('-c, --columns <n>', 'The number of columns', 4)
  .option('--caption', 'Whether to caption each image', false)
  .option('--caption-color <hex|transparent>', 'Image caption color', '#000000')
  .action((files, opts) => {
    const params = { files, ...opts };
    const sharedOptions = validateSharedOptions(params);
    const commandOptions = validateSquareOptions(params);
    const validatedParams = { ...sharedOptions, ...commandOptions };

    console.log(validatedParams);

    // run squareMerge
  });

addSharedOptions(squareCommand);
export default squareCommand;
