// pages/FinalRatingsPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinalRatings } from '../hooks/useFinalRatings';
import { Calculator, Settings, TrendingUp, FileText } from 'lucide-react';
import CalculateRatingsForm from '../components/CalculateRatingsForm';
import ConfigList from '../components/ConfigList';
import RatingResults from '../components/RatingResults';
import CreateConfigDialog from '../components/CreateConfigDialog';

const FinalRatingsPage: React.FC = () => {
  const {
    configs,
    activeConfig,
    calculationResult,
  } = useFinalRatings();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">
                Final Ratings
              </h1>
              <p className="text-muted-foreground">
                Calculate employee performance ratings for any period
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Settings className="w-4 h-4 mr-2" />
            New Config
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Configs
              </CardTitle>
              <Settings className="w-4 h-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {configs.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Config
              </CardTitle>
              <FileText className="w-4 h-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-foreground truncate">
                {activeConfig?.name || 'None'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="calculate" className="space-y-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="calculate">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Ratings
            </TabsTrigger>
            <TabsTrigger value="configs">
              <Settings className="w-4 h-4 mr-2" />
              Configurations
            </TabsTrigger>
            {calculationResult && (
              <TabsTrigger value="results">
                <TrendingUp className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="calculate">
            <CalculateRatingsForm />
          </TabsContent>

          <TabsContent value="configs">
            <ConfigList />
          </TabsContent>

          {calculationResult && (
            <TabsContent value="results">
              <RatingResults result={calculationResult} />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <CreateConfigDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

export default FinalRatingsPage;
