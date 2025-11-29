import { Command } from 'commander';
import { handleError } from '../../lib/helpers/utils.js';
import { validateDedupeOptions } from './helpers/validations.js';
import { deDuplicate } from '../../lib/dedupe/index.js';
import { loadImages } from '../../lib/helpers/loadImages.js';

const dedupeCommand = new Command('dedupe');

dedupeCommand
  .description('List or delete duplicate or highly similar images.')
  .argument('[files...]', 'List of image filepaths to detect duplicates from (use --dir for entire directories)')
  .option('-d, --dir <path>', 'Directory of images to detect duplicates from')
  .option('-r, --recursive', 'Recursively include subdirectories', false)
  .option('-t, --threshold <percentage>', 'Minimum similarity percentage for detecting duplicate images', 95)
  .option('-l, --list', 'List duplicates in the terminal', true)
  .option('-e, --erase', 'Erase all duplicates identified', false)
  .option(
    '-j, --json-report <path>',
    'Outputs a JSON report listing duplicate images at the given path',
    'duplicate-image-report.json'
  )
  .action(async (files, opts) => {
    await main(files, opts);
  });

const main = async (files, opts) => {
  try {
    const validatedParams = await validateDedupeOptions(files, opts);

    await runDeduplication(validatedParams);

    // Output success message
  } catch (e) {
    handleError(e);
  }
};

const runDeduplication = async (validatedParams) => {
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

  await deDuplicate(files, images, validatedParams);

  // if (success) {
  //   displaySuccessMessage(`\nImage has been created successfully: ${chalk.bold(validatedParams.output)}\n`);
  // }
};

export default dedupeCommand;