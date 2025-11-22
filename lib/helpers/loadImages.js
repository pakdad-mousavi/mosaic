import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { isSupportedInputImage, shuffleTogether } from './utils.js';

const MAX_RECURSION_DEPTH = 10;

export const loadImages = async ({ files, dir, recursive, shuffle }) => {
  let ignoredFiles = [];
  let filepaths = files;
  let images = [];

  if (files && files.length) {
    // Load directly from provided file list
    images = await loadFromFiles(files);
  } else {
    // Get all files from directory
    const { skippedFiles, paths } = await getFilesFromDirectory(dir, recursive);
    filepaths = paths;
    ignoredFiles = skippedFiles;
    images = await loadFromFiles(filepaths);
  }

  // Optional: shuffle filepaths and images together
  if (shuffle) {
    [filepaths, images] = shuffleTogether(filepaths, images);
  }

  return { images, files: filepaths, ignoredFiles };
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
  // Use to collect warnings
  const skippedFiles = [];

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
    // If it is an invalid file format, add to skipped files
    else if (entry.isFile() && !isSupportedInputImage(entry.name) && entry.name !== '.DS_Store') {
      skippedFiles.push(entry.name);
    }
    // If it's a directory AND the recursive option is true,
    // recursively get all the files
    else if (recursive && entry.isDirectory() && !entry.isSymbolicLink()) {
      const dirpath = path.join(entry.parentPath, entry.name);
      const dirObj = await getFilesFromDirectory(dirpath, recursive, depth + 1);
      files.push(...dirObj.paths);
      skippedFiles.push(...dirObj.skippedFiles);
    }
  }

  return { paths: files, skippedFiles };
};
