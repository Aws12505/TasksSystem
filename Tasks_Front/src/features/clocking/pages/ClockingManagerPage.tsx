// src/features/clocking/pages/ClockingManagerPage.tsx

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useClockingManager } from '../hooks/useClockingManager';
import { useClockingStore } from '../stores/clockingStore';
import { ManagerDashboard } from '../components/ManagerDashboard';
import { RecordsTable } from '../components/RecordsTable';
import { RefreshCw, Users } from 'lucide-react';

type DashboardLayout = 'list' | 'grid';

const ClockingManagerPage = () => {
  const { sessions, companyTimezone, isLoading, refresh, fetchAllRecords } = useClockingManager();
  const { managerAllRecords, managerAllRecordsPagination } = useClockingStore();
  const [filters, setFilters] = useState<any>({ per_page: 15 });

  // NEW: layout state
  const [layout] = useState<DashboardLayout>('grid');

  const handleFetchRecords = () => {
    fetchAllRecords(filters);
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
            {/* NEW: layout toggle */}
            {/* <div className="inline-flex rounded-md border border-input bg-background p-1">
              <Button
                type="button"
                size="sm"
                variant={layout === 'list' ? 'default' : 'ghost'}
                className="rounded-sm"
                onClick={() => setLayout('list')}
                aria-label="List layout"
                title="List layout"
              >
                <LayoutList className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={layout === 'grid' ? 'default' : 'ghost'}
                className="rounded-sm"
                onClick={() => setLayout('grid')}
                aria-label="Grid layout"
                title="Grid layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div> */}

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
              // NEW
              layout={layout}
            />
          </TabsContent>

          <TabsContent value="records" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">All Employee Records</CardTitle>
              </CardHeader>
              <CardContent>
                <RecordsTable
                  records={managerAllRecords}
                  companyTimezone={companyTimezone}
                  pagination={managerAllRecordsPagination}
                  showUser
                  onPageChange={(page) => setFilters({ ...filters, page })}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClockingManagerPage;
