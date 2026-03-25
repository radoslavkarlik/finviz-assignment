const units = ["B", "KB", "MB", "GB", "TB"];

export function formatTaxonomyBytes(size = 0): string {
  if (size === 0) {
    return "0 B";
  }

  const i = Math.floor(Math.log(size) / Math.log(1024));

  return `${(size / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}
