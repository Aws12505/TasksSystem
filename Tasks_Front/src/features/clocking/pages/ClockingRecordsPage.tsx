// src/features/clocking/pages/ClockingRecordsPage.tsx - FIXED

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useClockingRecords } from '../hooks/useClockingRecords';
import { useClockingStore } from '../stores/clockingStore';
import { useClockingCorrections } from '../hooks/useClockingCorrections';
import { RecordsTable } from '../components/RecordsTable';
import { PendingCorrectionsPanel } from '../components/PendingCorrectionsPanel';
import { RequestCorrectionDialog } from '../components/RequestCorrectionDialog';
import { CorrectionTypeSelector } from '../components/CorrectionTypeSelector';
import { Filter, X, Clock, Download, AlertCircle } from 'lucide-react';
import type { ClockSession } from '../../../types/Clocking';
import { CalendarWithInput } from '../../../components/ui/calendar-with-input'

const ClockingRecordsPage = () => {
  const [filters, setFilters] = useState<any>({ per_page: 15 });
  const [showFilters, setShowFilters] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRange, setExportRange] = useState<any>({ start_date: '', end_date: '' });
  const { records, pagination, isLoading, isExporting, exportRecords } = useClockingRecords(filters);
  const { companyTimezone } = useClockingStore();

  const {
    pendingCorrections,
    isLoading: correctionsLoading,
    requestCorrection,
    refresh: refreshCorrections,
  } = useClockingCorrections();

  // Type selector state
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [selectedSessionForCorrection, setSelectedSessionForCorrection] = useState<ClockSession | null>(null);

  // Request correction dialog state
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [correctionType, setCorrectionType] = useState<'clock_in' | 'clock_out' | 'break_in' | 'break_out'>('clock_in');
  const [selectedBreakRecord, setSelectedBreakRecord] = useState<any>(null);

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ per_page: 15 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handleExport = () => {
    const exportFilters = {
      start_date: exportRange.start_date || undefined,
      end_date: exportRange.end_date || undefined,
    };
    exportRecords(exportFilters);
    setShowExportDialog(false);
  };

  // Correct button - opens TYPE SELECTOR FIRST
  const handleCorrectionClick = (session: ClockSession) => {
    setSelectedSessionForCorrection(session);
    setTypeSelectorOpen(true);
  };

  // Type selector - opens REQUEST DIALOG with chosen type
  const handleCorrectionTypeSelect = (type: 'clock_in' | 'clock_out' | 'break_in' | 'break_out', breakId?: number) => {
    setCorrectionType(type);
    if (breakId && selectedSessionForCorrection?.break_records) {
      setSelectedBreakRecord(selectedSessionForCorrection.break_records.find(b => b.id === breakId));
    }
    setCorrectionDialogOpen(true);
  };

  const handleRequestCorrection = async (data: any) => {
    await requestCorrection(data);
    setCorrectionDialogOpen(false);
    setSelectedSessionForCorrection(null);
    setSelectedBreakRecord(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
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

        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="corrections">
              Corrections ({pendingCorrections.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="records" className="space-y-4">
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
                      <CalendarWithInput
  id="start_date"
  value={filters.start_date || ''}
  onChange={(v) => handleFilterChange('start_date', v)}
/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-foreground">End Date</Label>
                      <CalendarWithInput
  id="end_date"
  value={filters.end_date || ''}
  onChange={(v) => handleFilterChange('end_date', v)}
/>

                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  onCorrectionClick={handleCorrectionClick}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="corrections" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="bg-accent">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertCircle className="w-5 h-5 text-chart-2" />
                  My Pending Corrections
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-6">
                {pendingCorrections.length > 0 ? (
                  <PendingCorrectionsPanel
                    corrections={pendingCorrections}
                    isLoading={correctionsLoading}
                    onRefresh={refreshCorrections}
                    companyTimezone={companyTimezone}
                  />
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">
                      No pending correction requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                  <CalendarWithInput
  id="export_start_date"
  value={exportRange.start_date}
  onChange={(v) => setExportRange({ ...exportRange, start_date: v })}
/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="export_end_date" className="text-foreground">End Date (Optional)</Label>
                  <CalendarWithInput
  id="export_end_date"
  value={exportRange.end_date}
  onChange={(v) => setExportRange({ ...exportRange, end_date: v })}
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

      {/* Type Selector - Choose what to correct */}
      <CorrectionTypeSelector
        open={typeSelectorOpen}
        onOpenChange={setTypeSelectorOpen}
        session={selectedSessionForCorrection}
        onSelect={handleCorrectionTypeSelect}
        isLoading={correctionsLoading}
      />

      {/* Request Correction - Fill in the form */}
      <RequestCorrectionDialog
        open={correctionDialogOpen}
        onOpenChange={setCorrectionDialogOpen}
        type={correctionType}
        session={selectedSessionForCorrection}
        breakRecord={selectedBreakRecord}
        companyTimezone={companyTimezone}
        onSubmit={handleRequestCorrection}
        isLoading={correctionsLoading}
      />
    </div>
  );
};

export default ClockingRecordsPage;
