#!/usr/bin/env node

import { Command } from 'commander';
import mergeCommand from '../commands/merge/index.js';
import dedupeCommand from '../commands/dedupe/index.js';
import { configureCommandErrors, handleError } from '../lib/helpers/utils.js';

const program = new Command();

// Define program
program
  .name('pixeli')
  .description('A lightweight command-line tool for merging multiple images into customizable grid layouts.')
  .version('1.0.0');

// Add subcommands
program.addCommand(mergeCommand);
program.addCommand(dedupeCommand);

// Configure errors for all subcommands
configureCommandErrors(program);

// Parse arguments
try {
  program.parse();
} catch (e) {
  handleError(e);
}
