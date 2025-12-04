import { validateSharedOptions } from './validations.js';

export const addSharedOptions = (cmd) => {
  return cmd
    .argument('[files...]', 'Image filepaths to merge (use --dir for directories)')
    .option('-d, --dir <path>', 'Directory of images to merge')
    .option('-r, --recursive', 'Recursively include subdirectories', false)
    .option('--sh, --shuffle', 'Shuffle up images to randomize order in the grid', false)
    .option('--cr, --corner-radius <px>', 'How much to round the corners of each image', 0)
    .option('-g, --gap <px>', 'Gap between images', 50)
    .option('--bg, --canvas-color <hex|transparent>', 'Background color for canvas', '#ffffff')
    .option('-o, --output <file>', 'Output file path', './pixeli.png');
};

export const getValidatedParams = async (files, opts, validationFunc) => {
  const params = { files, ...opts };
  const sharedOptions = await validateSharedOptions(params);
  const commandOptions = validationFunc(sharedOptions, params);
  return { ...sharedOptions, ...commandOptions };
};
