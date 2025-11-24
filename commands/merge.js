import { Command } from 'commander';
import squareCommand from './square.js';
import masonryCommand from './masonry.js';
import gridCommand from './grid.js';

const mergeCommand = new Command('merge').description('Merge images into a grid layout.');

mergeCommand.addCommand(squareCommand);
mergeCommand.addCommand(masonryCommand);
mergeCommand.addCommand(gridCommand);

export default mergeCommand;
