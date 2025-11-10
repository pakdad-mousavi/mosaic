#!/usr/bin/env node

import { Command } from 'commander';
import mergeCommand from '../commands/merge.js';

const program = new Command();

// Define program
program
  .name('mosaic')
  .description(
    'A lightweight command-line tool for merging multiple images into customizable grid layouts.'
  )
  .version('1.0.0');

// Add subcommands
program.addCommand(mergeCommand);

// Parse arguments
program.parse();
