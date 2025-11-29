import readline from 'node:readline';
import path from 'node:path';
import chalk from 'chalk';
import { progressBar } from './progressBar.js';

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
        this.message = chalk.yellow(this.text);
        break;
      case 'success':
        this.message = chalk.blue(this.text);
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

export const configureCommandErrors = (cmd) => {
  // Configure error message for the current command
  cmd.configureOutput({
    writeErr: (str) => {
      const err = new Message(str.replace('error: ', ''), 'error');
      process.stderr.write(err.message);
    },
  });

  // Recursively configure error messages for all subcommands
  for (const subCmd of cmd.commands) {
    configureCommandErrors(subCmd);
  }
};

export const displayInfoMessage = (message) => {
  const m = new Message(message, 'neutral');
  console.log(m.message);
};

export const displayWarningMessage = (message) => {
  const m = new Message(message, 'warning');
  console.log(m.message);
};

export const displaySuccessMessage = (message) => {
  const m = new Message(message, 'success');
  console.log(m.message);
};

export const cliConfirm = (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(chalk.yellow(`${message} (Y/n) `), (value) => {
      const cleanedValue = value.toLowerCase().trim();
      if (cleanedValue === 'y' || !cleanedValue.length) resolve(true);
      else resolve(false);

      console.log();
      rl.close();
    });
  });
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

  // Update progress bar stage
  progressBar.update({ stage: 'Writing to file' });

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
    // Complete the progress bar
    progressBar.update(progressBar.getTotal());

    // Handle any errors
    const m = new Message('Failed to write image on disk: ' + e.message, 'error');
    console.log('\n' + m.message);

    return false;
  }

  // Complete the progress bar
  progressBar.update(progressBar.getTotal());

  return true;
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
