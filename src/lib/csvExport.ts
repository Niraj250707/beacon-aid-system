export interface CSVExportOptions {
  filename: string;
  headers: string[];
  data: Record<string, any>[];
  columns: string[];
}

export const exportToCSV = ({ filename, headers, data, columns }: CSVExportOptions): void => {
  const csvRows: string[] = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = columns.map(col => {
      const value = row[col];
      // Handle null/undefined
      if (value === null || value === undefined) return '';
      // Handle strings with commas or quotes
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportTransactions = (transactions: any[]) => {
  exportToCSV({
    filename: 'transactions',
    headers: ['ID', 'Type', 'Amount', 'From', 'To', 'Category', 'Status', 'Date', 'Block Number', 'TX Hash'],
    columns: ['id', 'type', 'amount', 'from_address', 'to_address', 'category', 'status', 'timestamp', 'block_number', 'tx_hash'],
    data: transactions,
  });
};

export const exportBeneficiaries = (beneficiaries: any[]) => {
  exportToCSV({
    filename: 'beneficiaries',
    headers: ['ID', 'Name', 'Phone', 'Wallet Address', 'Status', 'Household Size', 'Total Received', 'Total Spent', 'Daily Spent', 'Enrolled At'],
    columns: ['id', 'name', 'phone', 'wallet_address', 'status', 'household_size', 'total_received', 'total_spent', 'daily_spent', 'enrolled_at'],
    data: beneficiaries,
  });
};

export const exportMerchants = (merchants: any[]) => {
  exportToCSV({
    filename: 'merchants',
    headers: ['ID', 'Business Name', 'Category', 'Wallet Address', 'Status', 'Total Received', 'Total Cashed Out', 'Risk Level', 'Risk Score', 'Registered At'],
    columns: ['id', 'business_name', 'category', 'wallet_address', 'status', 'total_received', 'total_cashed_out', 'risk_level', 'risk_score', 'registered_at'],
    data: merchants,
  });
};
