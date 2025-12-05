export default {
  canvas: {
    width: 1200,
    height: 1600,
    columns: 3,
    rows: 6,
    gap: 12,
    background: '#000',
  },
  slots: [
    { col: 1, row: 1, colSpan: 2, rowSpan: 2 },
    { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
    { col: 3, row: 2, colSpan: 1, rowSpan: 1 },
    { col: 1, row: 3, colSpan: 1, rowSpan: 2 },
    { col: 2, row: 3, colSpan: 2, rowSpan: 2 },
    { col: 1, row: 5, colSpan: 3, rowSpan: 2 },
  ],
};
