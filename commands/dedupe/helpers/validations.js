import fs from 'node:fs/promises';
export const validateDedupeOptions = async (files, opts) => {
  // Destructure params
  const { dir, recursive, threshold, list, erase, jsonReport } = opts;

  // Conduct validations
  if ((!files || !files.length) && !dir) {
    throw new Error('You must specify either [files...] or --dir.');
  }

  // Ensure dir is a valid dir path
  if (dir?.length) {
    let stats;

    try {
      stats = await fs.stat(dir);
    } catch (e) {
      throw new Error('Path does not exist.');
    }

    if (!stats.isDirectory()) {
      throw new Error('Path is not a directory.');
    }
  }

  // Ensure threshold is a valid number
  if (isNaN(threshold) || !Number.isInteger(Number(threshold)) || 0 > threshold > 100) {
    throw new Error('--threshold must be a positive integer between 0 - 100.');
  }

  const formattedParams = {
    files: files || [],
    dir,
    recursive,
    threshold,
    list,
    erase,
    jsonReport,
  };

  return formattedParams;
};
