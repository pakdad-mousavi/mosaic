import { validateSharedOptions } from './validations.js';
import chalk from 'chalk';
import path from 'node:path';

export const SUPPORTED_INPUT_FORMATS = ['.webp', '.gif', '.jpeg', '.jpg', '.png', '.tiff', '.avif', '.svg'];
export const SUPPORTED_OUTPUT_FORMATS = ['.webp', '.gif', '.jpeg', '.jpg', '.png', '.tiff', '.avif'];

// Message class used for logging
export class Message {
  constructor(text, type) {
    this.text = text;
    this.type = type;

    switch (this.type) {
      case 'error':
        this.message = chalk.bold.red('Error: ') + chalk.red(this.text);
        break;
      case 'warning':
        this.message = chalk.bold.yellow('Warning: ') + chalk.yellow(this.text);
        break;
      case 'success':
        this.message = chalk.bold.green('Error: ') + chalk.green(this.text);
        break;
      case 'neutral':
        this.message = chalk.gray(this.text);
        break;
      default:
        this.message = chalk.gray(this.text);
        break;
    }
  }
}

export const addSharedOptions = (cmd) => {
  return cmd
    .argument('[files...]', 'Image filepaths to merge (use --dir for directories)')
    .option('-d, --dir <path>', 'Directory of images to merge')
    .option('-r, --recursive', 'Recursively include subdirectories', false)
    .option('--sh, --shuffle', 'Shuffle up images to randomize order in the grid', false)
    .option('-g, --gap <px>', 'Gap between images', 50)
    .option('--bg, --canvas-color <hex>', 'Background color for canvas', '#ffffff')
    .option('-o, --output <file>', 'Output file path', './mosaic.png');
};

export const isValidHexadecimal = (str) => {
  const hexRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return hexRegex.test(str);
};

export const parseAspectRatio = (input) => {
  // return ratio straight away if its just a number
  const ratio = Number(input);
  if (ratio) {
    return ratio;
  }

  const ratioRegex = /^\s*(\d+)\s*(\/|:|x)\s*(\d+)\s*$/i;
  const match = input.match(ratioRegex);

  // not parsable
  if (!match) {
    return null;
  }

  const width = parseInt(match[1], 10);
  const height = parseInt(match[3], 10);

  return width / height;
};

export const handleError = (error) => {
  const m = new Message(error.message, 'error');
  console.log(m.message);
};

export const displayWarningMessage = (warning) => {
  const m = new Message(warning, 'warning');
  console.log(m.message);
};

export const isSupportedInputImage = (filename) => {
  for (const supportedFormat of SUPPORTED_INPUT_FORMATS) {
    if (filename.endsWith(supportedFormat)) {
      return true;
    }
  }
  return false;
};

export const isSupportedOutputImage = (filename) => {
  for (const supportedFormat of SUPPORTED_OUTPUT_FORMATS) {
    if (filename.endsWith(supportedFormat)) {
      return true;
    }
  }
  return false;
};

export const writeImage = async (image, output) => {
  // Define file size limits
  const LIMITS = {
    png: 2_147_483_647,
    jpg: 65_535,
    jpeg: 65_535,
    avif: 65_535,
    webp: 16_383,
  };

  try {
    // Get image width and height
    const { width, height } = await image.metadata();
    const format = path.extname(output).replaceAll('.', '');

    // Ensure image can be encoded in the respective format
    const formatLimit = LIMITS[format];
    if (width > formatLimit || height > formatLimit) {
      throw new Error(`image is too large for ${format} format.`);
    }

    // Write to file
    await image.toFile(output);
  } catch (e) {
    const m = new Message('Failed to write image on disk: ' + e.message, 'error');
    console.log(m.message);
  }
};

export const getValidatedParams = (files, opts, validationFunc) => {
  const params = { files, ...opts };
  const sharedOptions = validateSharedOptions(params);
  const commandOptions = validationFunc(sharedOptions, params);
  return { ...sharedOptions, ...commandOptions };
};

export const shuffleArray = (array) => {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

export const shuffleTogether = (a, b) => {
  // 1. Build array of indices
  const indices = [...a.keys()];

  // 2. Shuffle the indices using your Fisher-Yates
  shuffleArray(indices);

  // 3. Apply same permutation to both arrays
  const aShuffled = indices.map((i) => a[i]);
  const bShuffled = indices.map((i) => b[i]);

  return [aShuffled, bShuffled];
};
