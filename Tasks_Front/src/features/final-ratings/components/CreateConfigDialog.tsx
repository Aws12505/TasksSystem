// features/finalRatings/components/CreateConfigDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinalRatings } from '../hooks/useFinalRatings';
import { Loader2 } from 'lucide-react';
import type { FinalRatingConfigData } from '../../../types/FinalRating';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'; // 👈 add this

interface CreateConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateConfigDialog: React.FC<CreateConfigDialogProps> = ({ open, onOpenChange }) => {
  const { defaultStructure, isLoading, createConfig, fetchDefaultStructure } = useFinalRatings();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: false,
  });

  const [config, setConfig] = useState<FinalRatingConfigData | null>(null);

  useEffect(() => {
    if (open && !defaultStructure) {
      fetchDefaultStructure();
    }
  }, [open, defaultStructure, fetchDefaultStructure]);

  useEffect(() => {
    if (defaultStructure && !config) {
      setConfig(JSON.parse(JSON.stringify(defaultStructure)));
    }
  }, [defaultStructure, config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    const result = await createConfig({
      ...formData,
      config,
    });

    if (result) {
      onOpenChange(false);
      setFormData({ name: '', description: '', is_active: false });
      setConfig(null);
    }
  };

  const updateConfig = (path: string[], value: any) => {
    if (!config) return;

    const newConfig = JSON.parse(JSON.stringify(config));
    let current: any = newConfig;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;
    setConfig(newConfig);
  };

  if (!config) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] p-0 overflow-hidden">
        {/* Non-scrolling header */}
        <div className="border-b px-6 py-5">
          <DialogHeader>
            <DialogTitle>Create New Configuration</DialogTitle>
            <DialogDescription>
              Configure how ratings are calculated for different components
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable body (form + tabs). Vertical custom scrollbar; horizontal appears if needed */}
        <ScrollArea className="max-h-[calc(90vh-160px)]"> 
          {/* 160px ≈ header (≈72–88) + sticky footer (≈64). Tweak if your spacing differs. */}
          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Configuration Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Q1 2025 Performance Rating"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description of this configuration"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Set as active configuration</Label>
              </div>
            </div>

            <Separator />

            {/* Component Configuration */}
            <Tabs defaultValue="task_ratings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="task_ratings">Tasks</TabsTrigger>
                <TabsTrigger value="stakeholder">Stakeholder</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>

              {/* Task Ratings Tab */}
              <TabsContent value="task_ratings" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="task_enabled">Enable Task Ratings</Label>
                  <Switch
                    id="task_enabled"
                    checked={config.task_ratings.enabled}
                    onCheckedChange={(checked) =>
                      updateConfig(['task_ratings', 'enabled'], checked)
                    }
                  />
                </div>

                {config.task_ratings.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="task_weight">Include Task Weight</Label>
                      <Switch
                        id="task_weight"
                        checked={config.task_ratings.include_task_weight}
                        onCheckedChange={(checked) =>
                          updateConfig(['task_ratings', 'include_task_weight'], checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="task_percentage">Include User Assignment Percentage</Label>
                      <Switch
                        id="task_percentage"
                        checked={config.task_ratings.include_user_percentage}
                        onCheckedChange={(checked) =>
                          updateConfig(['task_ratings', 'include_user_percentage'], checked)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="task_aggregation">Aggregation Method</Label>
                      <select
                        id="task_aggregation"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={config.task_ratings.aggregation}
                        onChange={(e) =>
                          updateConfig(['task_ratings', 'aggregation'], e.target.value)
                        }
                      >
                        <option value="sum">Sum</option>
                        <option value="average">Average</option>
                      </select>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Stakeholder Ratings Tab */}
              <TabsContent value="stakeholder" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="stakeholder_enabled">Enable Stakeholder Ratings</Label>
                  <Switch
                    id="stakeholder_enabled"
                    checked={config.stakeholder_ratings.enabled}
                    onCheckedChange={(checked) =>
                      updateConfig(['stakeholder_ratings', 'enabled'], checked)
                    }
                  />
                </div>

                {config.stakeholder_ratings.enabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="stakeholder_percentage">Include Project Percentage</Label>
                      <Switch
                        id="stakeholder_percentage"
                        checked={config.stakeholder_ratings.include_project_percentage}
                        onCheckedChange={(checked) =>
                          updateConfig(['stakeholder_ratings', 'include_project_percentage'], checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="stakeholder_weight">Include Task Weight</Label>
                      <Switch
                        id="stakeholder_weight"
                        checked={config.stakeholder_ratings.include_task_weight}
                        onCheckedChange={(checked) =>
                          updateConfig(['stakeholder_ratings', 'include_task_weight'], checked)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stakeholder_aggregation">Aggregation Method</Label>
                      <select
                        id="stakeholder_aggregation"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={config.stakeholder_ratings.aggregation}
                        onChange={(e) =>
                          updateConfig(['stakeholder_ratings', 'aggregation'], e.target.value)
                        }
                      >
                        <option value="sum">Sum</option>
                        <option value="average">Average</option>
                      </select>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* Other Components Tab */}
              <TabsContent value="other" className="space-y-6">
                {/* Help Requests (Helper) */}
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="help_helper_enabled">Help Requests (as Helper)</Label>
                    <Switch
                      id="help_helper_enabled"
                      checked={config.help_requests_helper.enabled}
                      onCheckedChange={(checked) =>
                        updateConfig(['help_requests_helper', 'enabled'], checked)
                      }
                    />
                  </div>

                  {config.help_requests_helper.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="points_per_help">Points per Help</Label>
                        <Input
                          id="points_per_help"
                          type="number"
                          step="0.01"
                          value={config.help_requests_helper.points_per_help}
                          onChange={(e) =>
                            updateConfig(
                              ['help_requests_helper', 'points_per_help'],
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="helper_max_points">Maximum Points</Label>
                        <Input
                          id="helper_max_points"
                          type="number"
                          step="0.01"
                          value={config.help_requests_helper.max_points}
                          onChange={(e) =>
                            updateConfig(
                              ['help_requests_helper', 'max_points'],
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Help Requests (Requester) */}
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="help_requester_enabled">Help Requests (as Requester)</Label>
                    <Switch
                      id="help_requester_enabled"
                      checked={config.help_requests_requester.enabled}
                      onCheckedChange={(checked) =>
                        updateConfig(['help_requests_requester', 'enabled'], checked)
                      }
                    />
                  </div>

                  {config.help_requests_requester.enabled && (
                    <div className="space-y-3">
                      <Label>Penalties by Request Type</Label>
                      {Object.entries(config.help_requests_requester.penalties).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Label className="flex-1 capitalize">
                            {key.replace(/_/g, ' ')}
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="w-24"
                            value={value as number}
                            onChange={(e) =>
                              updateConfig(
                                ['help_requests_requester', 'penalties', key],
                                parseFloat(e.target.value)
                              )
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tickets Resolved */}
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tickets_enabled">Tickets Resolved</Label>
                    <Switch
                      id="tickets_enabled"
                      checked={config.tickets_resolved.enabled}
                      onCheckedChange={(checked) =>
                        updateConfig(['tickets_resolved', 'enabled'], checked)
                      }
                    />
                  </div>

                  {config.tickets_resolved.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="points_per_ticket">Points per Ticket</Label>
                        <Input
                          id="points_per_ticket"
                          type="number"
                          step="0.01"
                          value={config.tickets_resolved.points_per_ticket}
                          onChange={(e) =>
                            updateConfig(
                              ['tickets_resolved', 'points_per_ticket'],
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tickets_max_points">Maximum Points</Label>
                        <Input
                          id="tickets_max_points"
                          type="number"
                          step="0.01"
                          value={config.tickets_resolved.max_points}
                          onChange={(e) =>
                            updateConfig(
                              ['tickets_resolved', 'max_points'],
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Sticky footer inside the scroller, so buttons stay visible */}
            <DialogFooter className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70 -mx-6 px-6 py-4 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Configuration'
                )}
              </Button>
            </DialogFooter>
          </form>

          {/* show horizontal bar if any inner content gets wide */}
          <ScrollBar orientation="horizontal" />
          {/* vertical shows automatically, but you can be explicit too */}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateConfigDialog;
