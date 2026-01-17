import { DatasetRow } from './csvParser';

export type DataType = 'numerical' | 'categorical' | 'binary' | 'ordinal';

export interface ColumnInfo {
  name: string;
  dataType: DataType;
  nullCount: number;
  uniqueCount: number;
  uniqueValues?: (string | number)[];
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
}

export interface DatasetAnalysis {
  rowCount: number;
  columnCount: number;
  columns: ColumnInfo[];
  missingValuesSummary: { [key: string]: number };
  categoricalColumns: string[];
  numericalColumns: string[];
  binaryColumns: string[];
}

function detectDataType(values: (string | number | null)[]): DataType {
  const nonNullValues = values.filter(v => v !== null);
  if (nonNullValues.length === 0) return 'categorical';

  const numericValues = nonNullValues.filter(v => typeof v === 'number');
  const uniqueValues = new Set(nonNullValues);

  if (numericValues.length === nonNullValues.length) {
    if (uniqueValues.size === 2) {
      return 'binary';
    }
    return 'numerical';
  }

  if (uniqueValues.size === 2) {
    return 'binary';
  }

  if (uniqueValues.size < 10 && uniqueValues.size < nonNullValues.length * 0.5) {
    return 'categorical';
  }

  return 'categorical';
}

function calculateStats(values: number[]) {
  if (values.length === 0) return { min: 0, max: 0, mean: 0, median: 0, std: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;

  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(variance);

  return { min, max, mean, median, std };
}

export function analyzeDataset(data: DatasetRow[]): DatasetAnalysis {
  if (data.length === 0) {
    return {
      rowCount: 0,
      columnCount: 0,
      columns: [],
      missingValuesSummary: {},
      categoricalColumns: [],
      numericalColumns: [],
      binaryColumns: [],
    };
  }

  const headers = Object.keys(data[0]);
  const columns: ColumnInfo[] = [];
  const missingValuesSummary: { [key: string]: number } = {};
  const categoricalColumns: string[] = [];
  const numericalColumns: string[] = [];
  const binaryColumns: string[] = [];

  headers.forEach(header => {
    const values = data.map(row => row[header]);
    const nonNullValues = values.filter(v => v !== null);
    const nullCount = values.length - nonNullValues.length;
    const uniqueValues = Array.from(new Set(nonNullValues));
    const dataType = detectDataType(values);

    const columnInfo: ColumnInfo = {
      name: header,
      dataType,
      nullCount,
      uniqueCount: uniqueValues.length,
    };

    if (dataType === 'numerical') {
      const numericValues = nonNullValues.filter(v => typeof v === 'number') as number[];
      const stats = calculateStats(numericValues);
      columnInfo.min = stats.min;
      columnInfo.max = stats.max;
      columnInfo.mean = stats.mean;
      columnInfo.median = stats.median;
      columnInfo.std = stats.std;
      numericalColumns.push(header);
    } else if (dataType === 'categorical') {
      columnInfo.uniqueValues = uniqueValues.slice(0, 10);
      categoricalColumns.push(header);
    } else if (dataType === 'binary') {
      columnInfo.uniqueValues = uniqueValues;
      binaryColumns.push(header);
    }

    columns.push(columnInfo);

    if (nullCount > 0) {
      missingValuesSummary[header] = nullCount;
    }
  });

  return {
    rowCount: data.length,
    columnCount: headers.length,
    columns,
    missingValuesSummary,
    categoricalColumns,
    numericalColumns,
    binaryColumns,
  };
}

export function generateReport(
  filename: string,
  data: DatasetRow[],
  analysis: DatasetAnalysis
): string {
  const lines: string[] = [];

  lines.push(`DATASET ANALYSIS REPORT`);
  lines.push(`========================\n`);
  lines.push(`Dataset: ${filename}`);
  lines.push(`Date: ${new Date().toLocaleDateString()}\n`);

  lines.push(`OVERVIEW`);
  lines.push(`--------`);
  lines.push(`Total Rows: ${analysis.rowCount}`);
  lines.push(`Total Columns: ${analysis.columnCount}\n`);

  lines.push(`DATA TYPES`);
  lines.push(`----------`);
  lines.push(`Numerical Columns (${analysis.numericalColumns.length}): ${analysis.numericalColumns.join(', ') || 'None'}`);
  lines.push(`Categorical Columns (${analysis.categoricalColumns.length}): ${analysis.categoricalColumns.join(', ') || 'None'}`);
  lines.push(`Binary Columns (${analysis.binaryColumns.length}): ${analysis.binaryColumns.join(', ') || 'None'}\n`);

  lines.push(`MISSING VALUES`);
  lines.push(`--------------`);
  if (Object.keys(analysis.missingValuesSummary).length === 0) {
    lines.push(`No missing values detected.\n`);
  } else {
    Object.entries(analysis.missingValuesSummary).forEach(([col, count]) => {
      const percentage = ((count / analysis.rowCount) * 100).toFixed(2);
      lines.push(`${col}: ${count} (${percentage}%)`);
    });
    lines.push('');
  }

  lines.push(`COLUMN DETAILS`);
  lines.push(`--------------`);
  analysis.columns.forEach(col => {
    lines.push(`\n${col.name} (${col.dataType})`);
    lines.push(`  Unique Values: ${col.uniqueCount}`);
    lines.push(`  Missing Values: ${col.nullCount}`);

    if (col.dataType === 'numerical') {
      lines.push(`  Min: ${col.min?.toFixed(2)}`);
      lines.push(`  Max: ${col.max?.toFixed(2)}`);
      lines.push(`  Mean: ${col.mean?.toFixed(2)}`);
      lines.push(`  Median: ${col.median?.toFixed(2)}`);
      lines.push(`  Std Dev: ${col.std?.toFixed(2)}`);
    } else if (col.uniqueValues && col.uniqueValues.length > 0) {
      lines.push(`  Sample Values: ${col.uniqueValues.slice(0, 5).join(', ')}`);
    }
  });

  lines.push(`\n\nML READINESS ASSESSMENT`);
  lines.push(`-----------------------`);

  if (analysis.rowCount < 100) {
    lines.push(`Warning: Dataset may be too small for reliable ML models (${analysis.rowCount} rows)`);
  } else {
    lines.push(`Dataset size is adequate for machine learning (${analysis.rowCount} rows)`);
  }

  const missingPercentage = (Object.values(analysis.missingValuesSummary).reduce((a, b) => a + b, 0) / (analysis.rowCount * analysis.columnCount)) * 100;
  if (missingPercentage > 10) {
    lines.push(`Warning: High percentage of missing values (${missingPercentage.toFixed(2)}%)`);
  }

  return lines.join('\n');
}
