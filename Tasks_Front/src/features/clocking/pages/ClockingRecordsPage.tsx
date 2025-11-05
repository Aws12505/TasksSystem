// src/features/clocking/pages/ClockingRecordsPage.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useClockingRecords } from '../hooks/useClockingRecords';
import { useClockingStore } from '../stores/clockingStore';
import { RecordsTable } from '../components/RecordsTable';
import { Filter, X, Clock, Download } from 'lucide-react';

const ClockingRecordsPage = () => {
  const [filters, setFilters] = useState<any>({ per_page: 15 });
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRange, setExportRange] = useState<any>({ start_date: '', end_date: '' });
  const { records, pagination, isLoading, isExporting, exportRecords } = useClockingRecords(filters);
  const { companyTimezone } = useClockingStore();

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ per_page: 15 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  // NEW: Handle export with date range
  const handleExport = () => {
    const exportFilters = {
      start_date: exportRange.start_date || undefined,
      end_date: exportRange.end_date || undefined,
    };
    exportRecords(exportFilters);
    setShowExportDialog(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Clocking Records</h1>
              <p className="text-muted-foreground">View your clocking history</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-background border-input"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {/* NEW: Export button */}
            <Button 
              onClick={() => setShowExportDialog(true)}
              disabled={isExporting || records.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-foreground">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={filters.start_date || ''}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="bg-background border-input text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-foreground">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="bg-background border-input text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Records Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Your Records</CardTitle>
          </CardHeader>
          <CardContent>
            <RecordsTable
              records={records}
              companyTimezone={companyTimezone}
              pagination={pagination}
              onPageChange={handlePageChange}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* NEW: Export Date Range Dialog */}
        {showExportDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-card border-border w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-foreground">Export Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">Choose a date range or leave empty to export all records</p>
                
                <div className="space-y-2">
                  <Label htmlFor="export_start_date" className="text-foreground">Start Date (Optional)</Label>
                  <Input
                    id="export_start_date"
                    type="date"
                    value={exportRange.start_date}
                    onChange={(e) => setExportRange({ ...exportRange, start_date: e.target.value })}
                    className="bg-background border-input text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export_end_date" className="text-foreground">End Date (Optional)</Label>
                  <Input
                    id="export_end_date"
                    type="date"
                    value={exportRange.end_date}
                    onChange={(e) => setExportRange({ ...exportRange, end_date: e.target.value })}
                    className="bg-background border-input text-foreground"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowExportDialog(false)}
                    className="border-input"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockingRecordsPage;
