import { Command } from 'commander';
import masonryCommand from './masonry.js';
import gridCommand from './grid.js';
import collageCommand from './collage.js';

const mergeCommand = new Command('merge').description('Merge images into a grid layout.');

mergeCommand.addCommand(masonryCommand);
mergeCommand.addCommand(gridCommand);
mergeCommand.addCommand(collageCommand);

export default mergeCommand;
