import { useMemo } from 'react';
import { Search, Package, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { SparePart } from '@/backend';

interface SparePartsTableProps {
  spareParts: SparePart[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

export default function SparePartsTable({
  spareParts,
  searchQuery,
  onSearchChange,
  totalCount,
}: SparePartsTableProps) {
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const filteredParts = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return spareParts;
    }

    const query = debouncedQuery.toLowerCase();
    return spareParts.filter(
      (part) =>
        part.partNumber.toLowerCase().includes(query) ||
        part.description.toLowerCase().includes(query) ||
        (part.location || '').toLowerCase().includes(query) ||
        (part.category || '').toLowerCase().includes(query) ||
        (part.uom || '').toLowerCase().includes(query) ||
        (part.room || '').toLowerCase().includes(query) ||
        (part.cabinet || '').toLowerCase().includes(query) ||
        (part.rackSlot || '').toLowerCase().includes(query) ||
        String(part.currentStock).includes(query)
    );
  }, [spareParts, debouncedQuery]);

  const displayedParts = filteredParts.slice(0, 100);
  const hasMore = filteredParts.length > 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Spare Parts Inventory
            </CardTitle>
            <CardDescription>
              {totalCount} total parts · {filteredParts.length} matching your search
            </CardDescription>
          </div>
          <Badge variant="secondary" className="w-fit">
            {totalCount} Parts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by part code, name, UOM, category, stock, room, cabinet, or rack/slot..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredParts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No spare parts match your search.</p>
          </div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Part Code</TableHead>
                      <TableHead className="font-semibold">Spare Name</TableHead>
                      <TableHead className="font-semibold">UOM</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Current Stock</TableHead>
                      <TableHead className="font-semibold">Room</TableHead>
                      <TableHead className="font-semibold">Cabinet</TableHead>
                      <TableHead className="font-semibold">Rack/Slot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedParts.map((part) => {
                      // Create stable key from identifying fields
                      const key = `${part.partNumber}-${part.location}-${part.room}-${part.cabinet}-${part.rackSlot}`;
                      return (
                        <TableRow key={key} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-sm font-medium">
                            {part.partNumber}
                          </TableCell>
                          <TableCell className="text-sm">{part.description}</TableCell>
                          <TableCell className="text-sm">
                            {part.uom || '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {part.category ? (
                              <Badge variant="outline" className="text-xs">
                                {part.category}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {String(part.currentStock)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {part.room || '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {part.cabinet || '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {part.rackSlot || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {hasMore && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 100 results. Refine your search to see more specific results.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
