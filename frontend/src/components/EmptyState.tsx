import { Upload, FileSpreadsheet } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-primary/5 flex items-center justify-center">
              <FileSpreadsheet className="w-12 h-12 text-primary/40" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Upload className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">No Data Yet</h2>
          <p className="text-muted-foreground">
            Upload your Excel master data file to start searching for spare parts.
            We support .xlsx and .xls formats.
          </p>
        </div>
      </div>
    </div>
  );
}
