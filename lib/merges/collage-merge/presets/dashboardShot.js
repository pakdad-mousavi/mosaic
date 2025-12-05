export default {
  canvas: {
    width: 1800,
    height: 1200,
    columns: 6,
    rows: 4,
    gap: 10,
    background: '#000',
  },
  slots: [
    { col: 1, row: 1, colSpan: 3, rowSpan: 2 },
    { col: 4, row: 1, colSpan: 3, rowSpan: 1 },
    { col: 4, row: 2, colSpan: 3, rowSpan: 1 },
    { col: 1, row: 3, colSpan: 2, rowSpan: 2 },
    { col: 3, row: 3, colSpan: 2, rowSpan: 2 },
    { col: 5, row: 3, colSpan: 2, rowSpan: 2 },
  ],
};
