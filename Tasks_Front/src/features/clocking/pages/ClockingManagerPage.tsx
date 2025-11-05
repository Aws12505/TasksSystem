// src/features/clocking/pages/ClockingManagerPage.tsx - FIXED

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useClockingManager } from '../hooks/useClockingManager';
import { useClockingStore } from '../stores/clockingStore';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { RecordsTable } from '../components/RecordsTable';
import { RefreshCw, Users, Download, AlertCircle } from 'lucide-react';
import { useClockingCorrectionManager } from '../hooks/useClockingCorrectionManager';
import { CorrectionRequestsManager } from '../components/CorrectionRequestsManager';
import { DirectEditDialog } from '../components/DirectEditDialog';
import { CorrectionTypeSelector } from '../components/CorrectionTypeSelector';
import type { ClockSession } from '../../../types/Clocking';

type DashboardLayout = 'list' | 'grid';

const ClockingManagerPage = () => {
  const { sessions, companyTimezone, isLoading, isExporting, refresh, fetchAllRecords, exportAll } = useClockingManager();
  const { managerAllRecords, managerAllRecordsPagination, directEditClockSession, directEditBreakRecord } = useClockingStore();
  const { 
    corrections: pendingCorrections, 
    isLoading: correctionsLoading, 
    handleCorrection 
  } = useClockingCorrectionManager();

  const [filters, setFilters] = useState<any>({ per_page: 15 });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportRange, setExportRange] = useState<any>({ start_date: '', end_date: '' });
  const [layout] = useState<DashboardLayout>('grid');

  // Type selector state
  const [typeSelectorOpen, setTypeSelectorOpen] = useState(false);
  const [selectedSessionForEdit, setSelectedSessionForEdit] = useState<ClockSession | null>(null);

  // Direct edit state
  const [directEditOpen, setDirectEditOpen] = useState(false);
  const [editType, setEditType] = useState<'clock_in' | 'clock_out' | 'break_in' | 'break_out'>('clock_in');
  const [editSession, setEditSession] = useState<ClockSession | null>(null);
  const [editBreak, setEditBreak] = useState<any>(null);

  // Track if records were ever fetched
  const [recordsFetched, setRecordsFetched] = useState(false);

  // Auto-fetch on first mount
  useEffect(() => {
    if (!recordsFetched) {
      fetchAllRecords(filters);
      setRecordsFetched(true);
    }
  }, []);

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchAllRecords(newFilters);
  };

  const handleRefreshRecords = () => {
    fetchAllRecords(filters);
  };

  const handleExport = () => {
    const exportFilters = {
      start_date: exportRange.start_date || undefined,
      end_date: exportRange.end_date || undefined,
    };
    exportAll(exportFilters);
    setShowExportDialog(false);
  };

  // Correct button - opens TYPE SELECTOR FIRST
  const handleCorrectionClick = (session: ClockSession) => {
    setSelectedSessionForEdit(session);
    setTypeSelectorOpen(true);
  };

  // Type selector - opens DIRECT EDIT with chosen type
  const handleCorrectionTypeSelect = (type: 'clock_in' | 'clock_out' | 'break_in' | 'break_out', breakId?: number) => {
    setEditType(type);
    setEditSession(selectedSessionForEdit);
    if (breakId && selectedSessionForEdit?.break_records) {
      setEditBreak(selectedSessionForEdit.break_records.find(b => b.id === breakId));
    }
    setDirectEditOpen(true);
  };

  const handleDirectEditSubmit = async (data: any) => {
    if (editType.includes('clock') && editSession) {
      await directEditClockSession(editSession.id, data);
    } else if (editType.includes('break') && editBreak) {
      await directEditBreakRecord(editBreak.id, data);
    }
    
    setDirectEditOpen(false);
    await fetchAllRecords(filters);
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
            <TabsTrigger value="records">All Records</TabsTrigger>
            <TabsTrigger value="corrections">
              Corrections ({pendingCorrections.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <ManagerDashboard 
              sessions={sessions} 
              companyTimezone={companyTimezone}
              layout={layout}
            />
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            {isLoading && recordsFetched ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <div className="inline-block">
                      <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mt-4">Loading records...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground">All Employee Records</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRefreshRecords}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                      className="border-input"
                    >
                      Refresh
                    </Button>
                    <Button 
                      onClick={() => setShowExportDialog(true)}
                      disabled={isExporting || managerAllRecords.length === 0}
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <RecordsTable
                    records={managerAllRecords}
                    companyTimezone={companyTimezone}
                    pagination={managerAllRecordsPagination}
                    showUser
                    onPageChange={handlePageChange}
                    isLoading={isLoading}
                    onCorrectionClick={handleCorrectionClick}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="corrections" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="bg-accent">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <AlertCircle className="w-5 h-5 text-chart-2" />
                  Pending Correction Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <CorrectionRequestsManager
                  corrections={pendingCorrections}
                  companyTimezone={companyTimezone}
                  isLoading={correctionsLoading}
                  onApprove={async (id, notes) => {
                    await handleCorrection(id, 'approve', notes);
                  }}
                  onReject={async (id, notes) => {
                    await handleCorrection(id, 'reject', notes);
                  }}
                  onDirectEdit={handleCorrectionClick}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Dialog */}
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

      {/* Type Selector */}
      <CorrectionTypeSelector
        open={typeSelectorOpen}
        onOpenChange={setTypeSelectorOpen}
        session={selectedSessionForEdit}
        onSelect={handleCorrectionTypeSelect}
        isLoading={correctionsLoading}
      />

      {/* Direct Edit Dialog */}
      <DirectEditDialog
        open={directEditOpen}
        onOpenChange={setDirectEditOpen}
        type={editType}
        session={editType.includes('clock') ? editSession : undefined}
        breakRecord={editType.includes('break') ? editBreak : undefined}
        companyTimezone={companyTimezone}
        onSubmit={handleDirectEditSubmit}
        isLoading={correctionsLoading}
      />
    </div>
  );
};

export default ClockingManagerPage;
