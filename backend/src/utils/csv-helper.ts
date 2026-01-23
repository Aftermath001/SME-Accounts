/**
 * CSV Utility Helper
 * Handles CSV generation for KRA-ready exports
 * Responsible for:
 * - Converting data to CSV format
 * - Proper escaping and formatting
 * - Numeric precision preservation
 * - Excel/iTax compatibility
 */

export interface CsvColumn {
  header: string;
  key: string;
  formatter?: (value: any) => string;
}

export class CsvHelper {
  /**
   * Convert array of objects to CSV string
   */
  static arrayToCsv<T extends Record<string, any>>(
    data: T[],
    columns: CsvColumn[]
  ): string {
    if (!data || data.length === 0) {
      return columns.map(col => col.header).join(',') + '\n';
    }

    // Create header row
    const headers = columns.map(col => this.escapeValue(col.header)).join(',');

    // Create data rows
    const rows = data.map(item => {
      return columns.map(col => {
        const value = item[col.key];
        const formattedValue = col.formatter ? col.formatter(value) : value;
        return this.escapeValue(formattedValue);
      }).join(',');
    });

    return [headers, ...rows].join('\n') + '\n';
  }

  /**
   * Escape CSV value (handle commas, quotes, newlines)
   */
  private static escapeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // If value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Format number for CSV (preserve precision)
   */
  static formatNumber(value: number, decimals = 2): string {
    if (typeof value !== 'number' || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(decimals);
  }

  /**
   * Format date for CSV (YYYY-MM-DD)
   */
  static formatDate(value: string | Date): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  }

  /**
   * Format boolean for CSV
   */
  static formatBoolean(value: boolean): string {
    return value ? 'Yes' : 'No';
  }

  /**
   * Generate filename for CSV export
   */
  static generateFilename(prefix: string, startDate: string, endDate: string): string {
    const start = startDate.replace(/-/g, '');
    const end = endDate.replace(/-/g, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').split('T')[0];
    
    return `${prefix}_${start}_${end}_${timestamp}.csv`;
  }

  /**
   * Set CSV response headers
   */
  static setCsvHeaders(res: any, filename: string): void {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

export default CsvHelper;