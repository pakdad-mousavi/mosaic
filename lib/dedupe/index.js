import chalk from 'chalk';
import { table } from 'table';

export const deDuplicate = async (files, images, opts) => {
  const { threshold, list, erase, jsonReport } = opts;

  const hashes = new Map();
  for (let i = 0; i < images.length; i++) {
    // Get current image and its corresponding file name
    const image = images[i];
    const filename = files[i];

    // Calculate the pHash for the image
    const pixels = await preprocessImage(image);
    const dct = dct2D(pixels);
    const hash = getPHash(dct);
    hashes.set(filename, hash);
  }

  // Go through all entries to collect similar pairs
  const entries = Array.from(hashes.entries());
  const pairs = [];

  // Loop through all pairs in O(n^2) time -> can be improved to O(n) with BK-trees
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [filename1, hash1] = entries[i];
      const [filename2, hash2] = entries[j];

      const similarity = getSimilarityPercentage(hash1, hash2);

      if (filename1 !== filename2 && similarity >= threshold) {
        const pair = [filename1, filename2];
        pairs.push(pair);
      }
    }
  }

  if (list) listTable(pairs);
};

const preprocessImage = async (image, size = 32) => {
  // Resize to size x size and convert to grayscale
  const { data, info } = await image.resize(size, size, { fit: 'fill' }).grayscale().raw().toBuffer({ resolveWithObject: true }); // resolveWithObject to get data and info

  // Convert Buffer to 2D array of pixel values
  const pixels = [];
  for (let y = 0; y < info.height; y++) {
    const row = [];
    for (let x = 0; x < info.width; x++) {
      const idx = y * info.width + x;
      row.push(data[idx]);
    }
    pixels.push(row);
  }

  return pixels;
};

const dct1D = (vector) => {
  // Initialize total size and final result
  const N = vector.length;
  const result = new Array(N).fill(0);

  // Loop through each frequency that will be used
  for (let k = 0; k < N; k++) {
    let sum = 0;
    // Loop through each pixel in the row at the current frequency
    for (let n = 0; n < N; n++) {
      // Apply DCT type II formula
      // Calculates the dot product of the pixel value and the cosine basis function to
      // see how much the cosine wave with k frequency appears in the row of pixels
      sum += vector[n] * Math.cos((Math.PI * (2 * n + 1) * k) / (2 * N));
    }

    // Alpha term used for normalization of cosine wave length
    const alpha = k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N);
    result[k] = alpha * sum;
  }
  return result;
};

const dct2D = (matrix) => {
  const N = matrix.length;

  // Apply 1D DCT to each row
  const rowDCT = matrix.map((row) => dct1D(row));

  // Transpose to apply DCT to columns
  const transposed = rowDCT[0].map((_, colIndex) => rowDCT.map((row) => row[colIndex]));

  // Apply 1D DCT to columns
  const colDCT = transposed.map((col) => dct1D(col));

  // Transpose back to original orientation
  return colDCT[0].map((_, i) => colDCT.map((row) => row[i]));
};

const getPHash = (dctMatrix, hashSize = 8) => {
  // Take top-left hashSize x hashSize block
  const block = [];
  for (let y = 0; y < hashSize; y++) {
    for (let x = 0; x < hashSize; x++) {
      block.push(dctMatrix[y][x]);
    }
  }

  // exclude DC component to ignore average image brightness
  const values = block.slice(1);

  // Compute median
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  // Convert to binary hash
  const hash = values.map((v) => (v > median ? 1 : 0)).join('');
  return hash;
};

const getHammingDistance = (hash1, hash2) => {
  // Calculates the number of bits different in each hash
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
};

const getSimilarityPercentage = (hash1, hash2) => {
  return (1 - getHammingDistance(hash1, hash2) / hash1.length) * 100;
};

const listTable = (pairs) => {
  // Define headers
  const header = [chalk.bold.yellow('#'), chalk.bold.blue('Filepath 1'), chalk.bold.blue('Filepath 2')];

  // Format pairs and append header
  const formattedPairs = pairs.map(([file1, file2], idx) => [chalk.yellow(idx + 1), chalk.white(file1), chalk.white(file2)]);
  formattedPairs.unshift(header);

  // Table config
  const config = {
    header: {
      content: chalk.bold.blue('All Duplicate Images'),
      alignment: 'center',
    },
    columns: [{ alignment: 'center' }, { alignment: 'center' }, { alignment: 'center' }],
  };

  // Display table
  console.log(table(formattedPairs, config));
};
