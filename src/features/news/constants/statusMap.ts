export const STATUS_MAP: Record<number, { text: string; color: string }> = {
  0: { text: "Borrador", color: "grey" },
  1: { text: "Preview", color: "orange" },
  2: { text: "Publicado", color: "green" },
};

export const STATUS_OPTIONS = Object.entries(STATUS_MAP).map(
  ([key, { text }]) => ({
    key,
    label: text,
    value: parseInt(key),
  })
);

export const FILTER_OPTIONS = [
  { key: "-1", label: "Todas", value: -1 },
  ...STATUS_OPTIONS,
];

export const DEFAULT_STATUS_TEXT = "Todas";
