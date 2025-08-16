export const TABLE_CONFIG = {
  defaultPageSize: 10,
  PageSizeOptions: ["10", "20", "50", "100"],
  showSizeChanger: false,
  showQuickJumper: false,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} de ${total} elementos`,
} as const;

export const COLUMN_WIDTHS = {
  title: undefined,
  author: 150,
  startDate: 120,
  endDate: 120,
  status: 120,
  stats: 200,
  actions: 80,
} as const;
