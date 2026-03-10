import type { SparePart } from '@/backend';

const BACKUP_KEY = 'spare-parts-backup';
const BACKUP_VERSION = 1;

export interface BackupPayload {
  version: number;
  savedAt: string;
  recordCount: number;
  spareParts: SparePart[];
}

/**
 * Save spare parts to browser localStorage
 */
export function saveBackup(spareParts: SparePart[]): void {
  try {
    const payload: BackupPayload = {
      version: BACKUP_VERSION,
      savedAt: new Date().toISOString(),
      recordCount: spareParts.length,
      spareParts,
    };
    
    // Convert BigInt to string for JSON serialization
    const serializable = {
      ...payload,
      spareParts: payload.spareParts.map(part => ({
        ...part,
        currentStock: part.currentStock.toString(),
      })),
    };
    
    localStorage.setItem(BACKUP_KEY, JSON.stringify(serializable));
  } catch (error) {
    console.error('Failed to save backup to localStorage:', error);
  }
}

/**
 * Load spare parts from browser localStorage
 */
export function loadBackup(): BackupPayload | null {
  try {
    const stored = localStorage.getItem(BACKUP_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Validate structure
    if (!parsed.version || !parsed.spareParts || !Array.isArray(parsed.spareParts)) {
      console.warn('Invalid backup structure, clearing');
      clearBackup();
      return null;
    }
    
    // Convert string back to BigInt
    const payload: BackupPayload = {
      version: parsed.version,
      savedAt: parsed.savedAt,
      recordCount: parsed.recordCount,
      spareParts: parsed.spareParts.map((part: any) => ({
        ...part,
        currentStock: BigInt(part.currentStock || '0'),
      })),
    };
    
    return payload;
  } catch (error) {
    console.error('Failed to load backup from localStorage:', error);
    return null;
  }
}

/**
 * Clear backup from localStorage
 */
export function clearBackup(): void {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch (error) {
    console.error('Failed to clear backup:', error);
  }
}

/**
 * Export backup as downloadable JSON file
 */
export function downloadBackup(): void {
  const backup = loadBackup();
  if (!backup) {
    throw new Error('No backup available to download');
  }
  
  // Create a blob with pretty-printed JSON
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const link = document.createElement('a');
  link.href = url;
  link.download = `spare-parts-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Check if a backup exists
 */
export function hasBackup(): boolean {
  return loadBackup() !== null;
}
