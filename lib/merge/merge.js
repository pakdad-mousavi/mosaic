import { Jimp } from 'jimp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { useSquaredMode } from './square.js';

const MAX_RECURSION_DEPTH = 10;
const LAYOUTS = ['square', 'preserve-aspect', 'adaptive', 'crop'];

export const main = async ({ files, dir, columns, size, layout, recursive }) => {
  const images = await loadImages({ files, dir, recursive });
  const sheet = await useSquaredMode(images, columns, size);
};

export const validateParams = ({ files, dir, columns, size, layout, recursive }) => {
  // Ensure that either a set of filepaths are given
  // or a directory path is given
  if ((!files || files.length === 0) && !dir) {
    throw new Error('No files or directories provided. Use file paths or --dir.');
  } else if (files && files.length && dir) {
    throw new Error('Provide either files or a directory, not both.');
  }

  // Ensure the given layout is valid
  if (!LAYOUTS.includes(layout)) {
    throw new Error(`Layout must be one of the following: ${LAYOUTS.join(', ')}`);
  }

  // Ensure columns is a positive integer
  if (isNaN(columns) || Number(columns) <= 0) {
    throw new Error('Columns must be a positive integer.');
  }

  // Ensure size is either null or a positive integer
  if ((size && isNaN(size)) || Number(size) <= 0) {
    throw new Error('Size must be a positive integer.');
  }
};

const loadImages = async ({ files, dir, recursive }) => {
  if (files && files.length) {
    return await loadFromFiles(files);
  } else {
    const allFiles = await getFilesFromDirectory(dir, recursive);
    return await loadFromFiles(allFiles);
  }
};

const loadFromFiles = async (files) => {
  const images = [];

  for (const filepath of files) {
    const image = await Jimp.read(filepath);
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
    // If the entry is a valid image file, add it to the list
    if (entry.isFile() && isSupportedImage(entry.name)) {
      const file = path.join(entry.parentPath, entry.name);
      files.push(file);
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

const isSupportedImage = (fileName = '') => {
  return (
    fileName.endsWith('.bmp') ||
    fileName.endsWith('.gif') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.tiff')
  );
};
