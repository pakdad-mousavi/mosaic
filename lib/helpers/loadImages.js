import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isSupportedImage } from './utils.js';

const MAX_RECURSION_DEPTH = 10;

export const loadImages = async ({ files, dir, recursive }) => {
  if (files && files.length) {
    const images = await loadFromFiles(files);
    return { images, files };
  } else {
    const allFiles = await getFilesFromDirectory(dir, recursive);
    const images = await loadFromFiles(allFiles);
    return { images, files: allFiles };
  }
};

const loadFromFiles = async (files) => {
  const images = [];

  for (const filepath of files) {
    const image = sharp(filepath);
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
