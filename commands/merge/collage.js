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
import { validateCollageOptions, validateSharedOptions } from './helpers/validations.js';
import { loadImages } from '../../lib/helpers/loadImages.js';
import { addSharedOptions } from './helpers/utils.js';
import { validateTemplate } from '../../lib/helpers/templateValidator.js';
import { collageMerge } from '../../lib/merges/collage-merge/index.js';

const collageCommand = new Command('collage');

collageCommand
  .description('Use JSON layouts to build custom collages.')
  .option('-t, --template <path>', 'The path to the JSON file describing the collage template', null)
  .option('-m, --mapping <json>', 'Inline JSON template override straight from the command line', null)
  .action(async (files, opts) => {
    await main(files, opts);
  });

const main = async (files, opts) => {
  // Collect and validate parameters
  try {
    const params = { files, ...opts };
    const sharedOptions = await validateSharedOptions(params);
    const collageOptions = await validateCollageOptions(opts);
    const validatedParams = { ...sharedOptions, ...collageOptions };

    // Load images, create collage, and write on disk
    await generateAndSaveCollage(validatedParams);

    // Output success message
  } catch (e) {
    handleError(e);
  }
};

const generateAndSaveCollage = async (validatedParams) => {
  // Validate the template and update it
  const validatedTemplate = validateTemplate(validatedParams.template);
  validatedParams.template = validatedTemplate;

  // Load images from file
  const { images, ignoredFiles } = await loadImages({ ...validatedParams, count: validatedParams.template.slots.length });

  // Display warnings if needed
  if (ignoredFiles.length) {
    displayWarningMessage('\nThese files will be ignored due to unsupported formats:');
    for (const file of ignoredFiles) {
      displayInfoMessage(file);
    }

    const confirmation = await cliConfirm('\nAre you sure you want to continue?');
    if (!confirmation) return;
  }

  const collage = await collageMerge(images, validatedParams);

  const success = await writeImage(collage, validatedParams.output);

  // Display success message
  if (success) {
    displaySuccessMessage(`\nImage has been created successfully: ${chalk.bold(validatedParams.output)}\n`);
  }
};

addSharedOptions(collageCommand);
export default collageCommand;
