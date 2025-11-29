import { Command } from 'commander';
import masonryCommand from './masonry.js';
import gridCommand from './grid.js';

const mergeCommand = new Command('merge').description('Merge images into a grid layout.');

mergeCommand.addCommand(masonryCommand);
mergeCommand.addCommand(gridCommand);

export default mergeCommand;
