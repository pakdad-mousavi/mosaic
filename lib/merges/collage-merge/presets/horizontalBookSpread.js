export default {
  canvas: {
    width: 2400,
    height: 1400,
    columns: 8,
    rows: 3,
    gap: 16,
    background: '#000',
  },
  slots: [
    { col: 1, row: 1, colSpan: 3, rowSpan: 3 },
    { col: 4, row: 1, colSpan: 5, rowSpan: 1 },
    { col: 4, row: 2, colSpan: 5, rowSpan: 2 },
  ],
};
