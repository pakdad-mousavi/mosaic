import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { displayWarningMessage, isSupportedInputImage, shuffleTogether } from './utils.js';
import chalk from 'chalk';

const MAX_RECURSION_DEPTH = 10;

export const loadImages = async ({ files, dir, recursive, shuffle }) => {
  let filepaths = files;
  let images = [];

  if (files && files.length) {
    // Load directly from provided file list
    images = await loadFromFiles(files);
  } else {
    // Get all files from directory
    filepaths = await getFilesFromDirectory(dir, recursive);
    images = await loadFromFiles(filepaths);
  }

  // Optional: shuffle filepaths and images together
  if (shuffle) {
    [filepaths, images] = shuffleTogether(filepaths, images);
  }

  return { images, files: filepaths };
};

const loadFromFiles = async (files) => {
  const images = [];

  for (const filepath of files) {
    let image;

    if (filepath.endsWith('.svg')) {
      const svgBuffer = await fs.readFile(filepath);
      image = sharp(svgBuffer);
    } else {
      image = sharp(filepath);
    }

    images.push(image);
  }

  return images;
};

const getFilesFromDirectory = async (dir, recursive, depth = 0) => {
  // Ensure recursiveness ends at the max recursion depth
  if (depth >= MAX_RECURSION_DEPTH) return [];

  // Get entries
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const file = path.join(entry.parentPath, entry.name);

    // If the entry is a valid image file, add it to the list
    if (entry.isFile() && isSupportedInputImage(entry.name)) {
      files.push(file);
    }
    // If it is an invalid file format, display an error
    else if (entry.isFile() && !isSupportedInputImage(entry.name)) {
      displayWarningMessage(`Invalid image format: ${chalk.underline(path.resolve(file))}\nSkipping image...\n`);
    }
    // If it's a directory AND the recursive option is true,
    // recursively get all the files
    else if (recursive && entry.isDirectory() && !entry.isSymbolicLink()) {
      const dirpath = path.join(entry.parentPath, entry.name);
      const subfiles = await getFilesFromDirectory(dirpath, recursive, depth + 1);
      files.push(...subfiles);
    }
  }

  return files;
};
