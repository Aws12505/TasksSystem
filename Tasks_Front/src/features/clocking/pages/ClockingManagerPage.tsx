// src/features/clocking/pages/ClockingManagerPage.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useClockingManager } from '../hooks/useClockingManager';
import { useClockingStore } from '../stores/clockingStore';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { RecordsTable } from '../components/RecordsTable';
import { RefreshCw, Users, Download } from 'lucide-react';

type DashboardLayout = 'list' | 'grid';

const ClockingManagerPage = () => {
  const { sessions, companyTimezone, isLoading, isExporting, refresh, fetchAllRecords, exportAll } = useClockingManager();
  const { managerAllRecords, managerAllRecordsPagination } = useClockingStore();
  const [filters, setFilters] = useState<any>({ per_page: 15 });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRange, setExportRange] = useState<any>({ start_date: '', end_date: '' });

  const [layout] = useState<DashboardLayout>('grid');

  const handleFetchRecords = () => {
    fetchAllRecords(filters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchAllRecords(newFilters);
  };

  // NEW: Handle export with date range
  const handleExport = () => {
    const exportFilters = {
      start_date: exportRange.start_date || undefined,
      end_date: exportRange.end_date || undefined,
    };
    exportAll(exportFilters);
    setShowExportDialog(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Clocking Manager</h1>
              <p className="text-muted-foreground">Monitor and manage employee clocking sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={refresh} 
              disabled={isLoading}
              variant="outline"
              className="bg-background border-input"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
            <TabsTrigger value="records" onClick={handleFetchRecords}>All Records</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <ManagerDashboard 
              sessions={sessions} 
              companyTimezone={companyTimezone}
              layout={layout}
            />
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">All Employee Records</CardTitle>
                {/* NEW: Export button */}
                <Button 
                  onClick={() => setShowExportDialog(true)}
                  disabled={isExporting || managerAllRecords.length === 0}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </CardHeader>
              <CardContent>
                <RecordsTable
                  records={managerAllRecords}
                  companyTimezone={companyTimezone}
                  pagination={managerAllRecordsPagination}
                  showUser
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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

export default ClockingManagerPage;
