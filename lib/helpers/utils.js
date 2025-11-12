import chalk from 'chalk';

export const SUPPORTED_IMAGES = ['.bmp', '.gif', '.jpeg', '.jpg', '.png', '.tiff'];

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
  const hexRegex = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  return hexRegex.test(str);
};

export const handleError = (error) => {
  const m = new Message(error.message, 'error');
  console.log(m.message);
};

export const displayWarningMessage = (warning) => {
  const m = new Message(warning, 'warning');
  console.log(m.message);
};

export const isSupportedImage = (filename) => {
  for (const supportedImage of SUPPORTED_IMAGES) {
    if (filename.endsWith(supportedImage)) {
      return true;
    }
  }
  return false;
};

export const writeImage = (image, output) => {
  try {
    image.write(output);
  } catch (e) {
    const m = new Message('Failed to write image on disk.', 'error');
    console.log(m);
  }
};
