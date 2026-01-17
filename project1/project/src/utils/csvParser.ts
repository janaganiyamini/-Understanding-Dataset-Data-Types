export interface DatasetRow {
  [key: string]: string | number | null;
}

export function parseCSV(csvText: string): DatasetRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data: DatasetRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: DatasetRow = {};

    headers.forEach((header, index) => {
      const value = values[index]?.trim() || null;

      if (value === null || value === '' || value === 'null' || value === 'NaN') {
        row[header] = null;
      } else if (!isNaN(Number(value))) {
        row[header] = Number(value);
      } else {
        row[header] = value;
      }
    });

    data.push(row);
  }

  return data;
}

export function getHeaders(data: DatasetRow[]): string[] {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
}
