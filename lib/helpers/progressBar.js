import { SingleBar } from 'cli-progress';
import chalk from 'chalk';

const title = chalk.gray('Creating Image:');
const bar = chalk.blue('{bar}');
const percentage = chalk.yellow('{percentage}%');
const eta = chalk.blue('ETA: ') + chalk.yellow('{eta_formatted}');
const stage = chalk.gray('{stage}...');
const divider = chalk.blue('|');

export const WRITING_TO_FILE_PERCENTAGE = 0.05;

export const progressBar = new SingleBar({
  format: `${title} ${divider}${bar}${divider} ${percentage} ${divider} ${eta} ${divider} ${stage} `,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  stopOnComplete: true,
  barsize: 40,
  etaBuffer: 50,
});
