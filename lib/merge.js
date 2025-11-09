import fs from 'node:fs/promises';
import path from 'node:path';

export const main = (commandObject, { files, dir }) => {
  
};

export const validateParams = async (commandObject, { files, dir }) => {
  // Ensure that either a set of filepaths are given
  // or a directory path is given
  if ((!files || files.length === 0) && !dir) {
    commandObject.error('No files or directories provided. Use file paths or --dir.', {
      exitCode: 2,
    });
  }
};
