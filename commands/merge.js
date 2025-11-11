import { Command } from 'commander';
import { main, validateParams } from '../lib/merge/merge.js';
import { Message } from '../lib/utils.js';

const mergeCommand = new Command('merge')
  .description('Merge images into a grid layout.')
  .argument('[files...]', 'Image filepaths to merge (use --dir for directories).')
  .option('-d, --dir <dirpath>', 'Path to the directory which contains your images.', false)
  .option('-c, --columns <columns>', 'Set the number of columns that you wish to have.', 4)
  .option(
    '--iw, --image-width <image-width>',
    'Set the image width in pixels to resize all images to (default is smallest image size).',
    null
  )
  .option(
    '--cw, --canvas-width <canvas-width>',
    'Set the entire canvas width in pixels, used only in adaptive mode.',
    null
  )
  .option(
    '-l, --layout <square|preserve-aspect|adaptive|crop>',
    'Set the layout mode to use when merging the images.',
    'square'
  )
  .option(
    '-r, --recursive',
    'Get all images in the directory given and all sub-directories. Max-depth is set to 10.',
    false
  )
  .action(async (files, options) => {
    // Define all possible parameters for this command
    const params = {
      files: files || false,
      dir: options.dir,
      columns: options.columns,
      imageWidth: options.imageWidth,
      canvasWidth: options.canvasWidth,
      layout: options.layout,
      recursive: options.recursive,
    };

    console.log(params);

    try {
      // Validate the params
      validateParams(params);

      // Run logic
      await main(params);
    } catch (e) {
      // Catch all errors
      const m = new Message(e.message, 'error');
      mergeCommand.error(m.message, { exitCode: 1 });
    }
  });

export default mergeCommand;
