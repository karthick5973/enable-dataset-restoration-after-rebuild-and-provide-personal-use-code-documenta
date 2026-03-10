import type { SparePart } from '@/backend';

// Simple XLSX parser for browser using FileReader
// This is a lightweight implementation that handles basic .xlsx files
export async function parseSpareParts(file: File): Promise<SparePart[]> {
  try {
    // For now, we'll use a dynamic import of xlsx from CDN
    // @ts-ignore - Dynamic import from CDN
    const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs');
    
    // Read file as ArrayBuffer
    const data = await file.arrayBuffer();
    
    // Parse the workbook
    const workbook = XLSX.read(data, { type: 'array' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('The Excel file contains no worksheets');
    }

    // Get the first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to array of arrays
    const rows: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rows || rows.length === 0) {
      throw new Error('The Excel file is empty');
    }

    if (rows.length < 2) {
      throw new Error('The Excel file must contain at least a header row and one data row');
    }

    // First row is headers
    const headers = rows[0].map((header) => String(header || '').trim());
    
    // Find columns (case-insensitive)
    const partNumberIndex = headers.findIndex((h) =>
      /part\s*number|part\s*no|partno|part\s*#|part\s*code/i.test(h)
    );
    const descriptionIndex = headers.findIndex((h) =>
      /description|desc|name|title|spare\s*name/i.test(h)
    );
    const locationIndex = headers.findIndex((h) =>
      /location|loc|bin|store|warehouse/i.test(h)
    );
    const categoryIndex = headers.findIndex((h) =>
      /category|cat|type|class|group/i.test(h)
    );
    const currentStockIndex = headers.findIndex((h) =>
      /current\s*stock|stock|quantity|qty|on\s*hand|available/i.test(h)
    );
    const uomIndex = headers.findIndex((h) =>
      /uom|unit\s*of\s*measure|unit|units|u\.o\.m/i.test(h)
    );
    const roomIndex = headers.findIndex((h) =>
      /room|room\s*no|room\s*number/i.test(h)
    );
    const cabinetIndex = headers.findIndex((h) =>
      /cabinet|cab|cupboard/i.test(h)
    );
    const rackSlotIndex = headers.findIndex((h) =>
      /rack\s*slot|rack\/slot|rack\s*\/\s*slot|rack|slot|shelf/i.test(h)
    );

    // If specific columns not found, use first two columns
    const partColIndex = partNumberIndex >= 0 ? partNumberIndex : 0;
    const descColIndex = descriptionIndex >= 0 ? descriptionIndex : 1;

    const spareParts: SparePart[] = [];

    // Process data rows (skip header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip completely empty rows
      if (!row || row.every((cell) => cell === null || cell === undefined || String(cell).trim() === '')) {
        continue;
      }

      const partNumber = String(row[partColIndex] || '').trim();
      const description = String(row[descColIndex] || '').trim();
      const location = locationIndex >= 0 ? String(row[locationIndex] || '').trim() : '';
      const category = categoryIndex >= 0 ? String(row[categoryIndex] || '').trim() : '';
      const uom = uomIndex >= 0 ? String(row[uomIndex] || '').trim() : '';
      const room = roomIndex >= 0 ? String(row[roomIndex] || '').trim() : '';
      const cabinet = cabinetIndex >= 0 ? String(row[cabinetIndex] || '').trim() : '';
      const rackSlot = rackSlotIndex >= 0 ? String(row[rackSlotIndex] || '').trim() : '';
      
      // Parse current stock safely
      let currentStock = 0n;
      if (currentStockIndex >= 0 && row[currentStockIndex] != null) {
        const stockValue = row[currentStockIndex];
        try {
          // Handle numbers, strings with commas/spaces
          const cleanedValue = String(stockValue).replace(/[,\s]/g, '').trim();
          const parsed = parseInt(cleanedValue, 10);
          if (!isNaN(parsed) && parsed >= 0) {
            currentStock = BigInt(parsed);
          }
        } catch {
          // Default to 0n on parse error
          currentStock = 0n;
        }
      }

      // Only add if part number exists
      if (partNumber) {
        spareParts.push({
          partNumber,
          description: description || 'No description',
          location,
          category,
          currentStock,
          uom,
          room,
          cabinet,
          rackSlot,
        });
      }
    }

    if (spareParts.length === 0) {
      throw new Error('No valid spare parts found. Please ensure your Excel file has part numbers in the first or labeled column.');
    }

    return spareParts;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
  }
}
