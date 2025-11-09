import { Command } from 'commander';
import { main, validateParams } from '../lib/merge.js';
import chalk from 'chalk';

const mergeCommand = new Command('merge')
  .description('Merge images into a grid layout.')
  .argument('[files...]', 'Image filepaths to merge (use --dir for directories).')
  .option('-d, --dir <dirpath>', 'Path to the directory which contains your images.', false)
  .action((files, options) => {
    // Define all possible parameters for this command
    const params = {
      files: files || false,
      dir: options.dir,
    };

    // Validate the params
    validateParams(mergeCommand, params);

    // Run logic
    main(mergeCommand, params);

    // Validate input
    // if ((!files || files.length === 0) && !options?.dir) {
    //   mergeCommand.error('No files or directories provided. Use file paths or --dir.', {
    //     exitCode: 2,
    //   });
    // }
  });

export default mergeCommand;
