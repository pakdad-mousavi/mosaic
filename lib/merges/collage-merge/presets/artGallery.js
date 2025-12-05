export default {
  canvas: {
    width: 2000,
    height: 1500,
    columns: 5,
    rows: 5,
    gap: 20,
    background: '#000',
  },
  slots: [
    { col: 1, row: 1, colSpan: 3, rowSpan: 3 },
    { col: 4, row: 1, colSpan: 2, rowSpan: 2 },
    { col: 4, row: 3, colSpan: 2, rowSpan: 1 },
    { col: 1, row: 4, colSpan: 2, rowSpan: 2 },
    { col: 3, row: 4, colSpan: 3, rowSpan: 2 },
  ],
};
