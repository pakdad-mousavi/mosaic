import { Command } from 'commander';
import squareCommand from './square.js';
import masonryCommand from './masonry.js';
import aspectCommand from './aspect.js';

const mergeCommand = new Command('merge').description('Merge images into a grid layout.');

mergeCommand.addCommand(squareCommand);
mergeCommand.addCommand(masonryCommand);
mergeCommand.addCommand(aspectCommand);

export default mergeCommand;
