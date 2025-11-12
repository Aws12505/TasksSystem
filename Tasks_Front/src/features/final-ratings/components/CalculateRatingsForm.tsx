// features/finalRatings/components/CalculateRatingsForm.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFinalRatings } from '../hooks/useFinalRatings';
import { Calculator, Loader2 } from 'lucide-react';
import { CalendarWithInput } from '@/components/ui/calendar-with-input'

const CalculateRatingsForm: React.FC = () => {
  const { configs, activeConfig, isLoading, calculateRatings, fetchActiveConfig } = useFinalRatings();

  const [formData, setFormData] = useState({
    period_start: '',
    period_end: '',
    max_points: '',
    config_id: '',
  });

  useEffect(() => {
    if (!activeConfig) {
      fetchActiveConfig();
    }
  }, [activeConfig, fetchActiveConfig]);

  useEffect(() => {
    if (activeConfig && !formData.config_id) {
      setFormData((prev) => ({ ...prev, config_id: activeConfig.id.toString() }));
    }
  }, [activeConfig, formData.config_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.period_start || !formData.period_end || !formData.max_points) {
      return;
    }

    const result = await calculateRatings({
      period_start: formData.period_start,
      period_end: formData.period_end,
      max_points: parseFloat(formData.max_points),
      config_id: formData.config_id ? parseInt(formData.config_id) : undefined,
    });

    if (result) {
      // Switch to results tab
      const resultsTab = document.querySelector('[value="results"]') as HTMLElement;
      if (resultsTab) {
        resultsTab.click();
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Calculate Final Ratings
        </CardTitle>
        <CardDescription>
          Select a period and specify the maximum points for 100% rating
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Period Start */}
            <div className="space-y-2">
  <Label htmlFor="period_start">Period Start</Label>
  <CalendarWithInput
    id="period_start"
    name="period_start"
    value={formData.period_start}
    onChange={(v) => handleChange('period_start', v)}
    required
  />
</div>

{/* Period End */}
<div className="space-y-2">
  <Label htmlFor="period_end">Period End</Label>
  <CalendarWithInput
    id="period_end"
    name="period_end"
    value={formData.period_end}
    onChange={(v) => handleChange('period_end', v)}
    required
    min={formData.period_start}
  />
</div>
          </div>

          {/* Max Points */}
          <div className="space-y-2">
            <Label htmlFor="max_points">
              Maximum Points for 100%
              <span className="text-muted-foreground text-sm ml-2">
                (How many points equals 100% rating?)
              </span>
            </Label>
            <Input
              id="max_points"
              type="number"
              step="0.01"
              min="1"
              value={formData.max_points}
              onChange={(e) => handleChange('max_points', e.target.value)}
              placeholder="e.g., 200"
              required
            />
          </div>

          {/* Config Selection */}
          <div className="space-y-2">
            <Label htmlFor="config_id">
              Rating Configuration
              <span className="text-muted-foreground text-sm ml-2">
                (Leave as active to use current default)
              </span>
            </Label>
            <Select
              value={formData.config_id}
              onValueChange={(value) => handleChange('config_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select configuration" />
              </SelectTrigger>
              <SelectContent>
                {configs.map((config) => (
                  <SelectItem key={config.id} value={config.id.toString()}>
                    {config.name} {config.is_active && '(Active)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Info Box */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">How it works:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All employees with tasks in the selected period will be calculated</li>
              <li>Each employee's percentage = (their total points / max points) × 100</li>
              <li>Maximum percentage is capped at 100%</li>
              <li>Results show full breakdown of how points were calculated</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Ratings
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CalculateRatingsForm;
