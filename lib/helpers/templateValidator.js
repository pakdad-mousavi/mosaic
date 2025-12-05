import Ajv from 'ajv';
import { isValidHexadecimal } from './utils.js';

// Define entire template schema
const TEMPLATE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['canvas', 'slots'],
  properties: {
    canvas: {
      type: 'object',
      additionalProperties: false,
      required: ['width', 'height', 'columns', 'rows', 'gap', 'background'],
      properties: {
        width: { type: 'number', minimum: 1, multipleOf: 1 },
        height: { type: 'number', minimum: 1, multipleOf: 1 },
        columns: { type: 'number', minimum: 1, multipleOf: 1 },
        rows: { type: 'number', minimum: 1, multipleOf: 1 },
        gap: { type: 'number', minimum: 0, multipleOf: 1 },
        background: { type: 'string' },
      },
    },

    slots: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['col', 'row', 'colSpan', 'rowSpan'],
        properties: {
          col: { type: 'number', minimum: 1, multipleOf: 1 },
          row: { type: 'number', minimum: 1, multipleOf: 1 },
          colSpan: { type: 'number', minimum: 1, multipleOf: 1 },
          rowSpan: { type: 'number', minimum: 1, multipleOf: 1 },
          borderRadius: { type: 'number', minimum: 0, multipleOf: 1 },
        },
      },
    },
  },
};

const ajv = new Ajv({ allErrors: true });

const validate = ajv.compile(TEMPLATE_SCHEMA);

export const validateTemplate = (json) => {
  const valid = validate(json);

  // Handle schema validation
  if (!valid) {
    const path = validate.errors[0].instancePath.slice(1).replaceAll('/', '.');
    const message = validate.errors[0].message;
    throw new Error(`${path} ${message}.`);
  }

  // Handle canvas background color
  if (json.canvas.background !== 'transparent' && !isValidHexadecimal(json.canvas.background)) {
    throw new Error(`Canvas color must be a valid hex value or "transparent".`);
  }
  json.canvas.background = json.canvas.background === 'transparent' ? { r: 0, g: 0, b: 0, alpha: 0 } : json.canvas.background;

  // Ensure canvas is wide enough for at least a single 1px column
  if (json.canvas.width <= json.canvas.gap * 2) {
    throw new Error(`Canvas width must be greater than ${json.canvas.gap * 2}.`);
  }

  // Ensure canvas is long enough for at least a single 1px row
  if (json.canvas.height <= json.canvas.gap * 2) {
    throw new Error(`Canvas height must be greater than ${json.canvas.gap * 2}.`);
  }

  // Calculate column width and row height
  const workableCanvasWidth = json.canvas.width - json.canvas.gap * (json.canvas.columns + 1);
  const workableCanvasHeight = json.canvas.height - json.canvas.gap * (json.canvas.rows + 1);
  const columnWidth = Math.floor(workableCanvasWidth / json.canvas.columns);
  const rowHeight = Math.floor(workableCanvasHeight / json.canvas.rows);

  // Ensure columns are thick enough
  if (columnWidth <= 0) {
    throw new Error(`Columns are too thin. Increase canvas width, reduce gap, or reduce number of columns.`);
  }

  // Ensure rows are thick enough
  if (rowHeight <= 0) {
    throw new Error(`Rows are too thin. Increase canvas height or reduce number of rows.`);
  }

  // For each slot...
  for (let i = 0; i < json.slots.length; i++) {
    const slot = json.slots[i];

    // Ensure slot is placed inside given canvas columns
    if (slot.col > json.canvas.columns) {
      throw new Error(`json.slots[${i}].col must be between 1 and ${json.canvas.columns}.`);
    }

    // Ensure slot is placed inside given canvas rows
    if (slot.row > json.canvas.rows) {
      throw new Error(`json.slots[${i}].row must be between 1 and ${json.canvas.rows}.`);
    }

    // Ensure slot spans within given canvas columns
    if (slot.col + slot.colSpan - 1 > json.canvas.columns) {
      throw new Error(`json.slots[${i}] spans past the right edge of the grid (col + colSpan exceeds columns).`);
    }

    // Ensure slot spans within given canvas rows
    if (slot.row + slot.rowSpan - 1 > json.canvas.rows) {
      throw new Error(`json.slots[${i}] spans past the bottom edge of the grid (row + rowSpan exceeds rows).`);
    }
  }

  // Ensure no slots overlap
  validateSlotOverlaps(json.slots);

  return json;
};

const validateSlotOverlaps = (slots) => {
  for (let i = 0; i < slots.length; i++) {
    const A = slots[i];

    const A_right = A.col + A.colSpan - 1;
    const A_bottom = A.row + A.rowSpan - 1;

    for (let j = i + 1; j < slots.length; j++) {
      const B = slots[j];

      const B_right = B.col + B.colSpan - 1;
      const B_bottom = B.row + B.rowSpan - 1;

      const overlap = A.col <= B_right && A_right >= B.col && A.row <= B_bottom && A_bottom >= B.row;

      if (overlap) {
        throw new Error(`Slot ${i} overlaps with slot ${j}.`);
      }
    }
  }
};
