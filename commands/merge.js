import { Command } from 'commander';
import squareCommand from './square.js';
import masonryCommand from './masonry.js';

const mergeCommand = new Command('merge').description('Merge images into a grid layout.');

mergeCommand.addCommand(squareCommand);
mergeCommand.addCommand(masonryCommand);

export default mergeCommand;
