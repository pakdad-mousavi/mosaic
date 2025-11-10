import chalk from 'chalk';

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
