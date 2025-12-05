export default {
  canvas: {
    width: 1400,
    height: 2100,
    columns: 2,
    rows: 3,
    gap: 20,
    background: '#000',
  },
  slots: [
    { col: 1, row: 1, colSpan: 2, rowSpan: 1 },
    { col: 1, row: 2, colSpan: 1, rowSpan: 2 },
    { col: 2, row: 2, colSpan: 1, rowSpan: 2 },
  ],
};
