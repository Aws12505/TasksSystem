// features/finalRatings/components/ConfigList.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFinalRatings } from '../hooks/useFinalRatings';
import { Edit, Trash2, CheckCircle, Settings } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EditConfigDialog from './EditConfigDialog';

const ConfigList: React.FC = () => {
  const { configs, isLoading, deleteConfig, activateConfig } = useFinalRatings();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [configToEdit, setConfigToEdit] = useState<number | null>(null);

  const handleDeleteClick = (id: number) => {
    setConfigToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (configToDelete) {
      const success = await deleteConfig(configToDelete);
      if (success) {
        setDeleteDialogOpen(false);
        setConfigToDelete(null);
      }
    }
  };

  const handleEditClick = (id: number) => {
    setConfigToEdit(id);
    setEditDialogOpen(true);
  };

  const handleActivateClick = async (id: number) => {
    await activateConfig(id);
  };

  if (isLoading && configs.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading configurations...</div>
        </CardContent>
      </Card>
    );
  }

  if (configs.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <Settings className="w-12 h-12 text-muted-foreground" />
          <div className="text-center">
            <h3 className="font-semibold text-lg">No configurations yet</h3>
            <p className="text-muted-foreground">
              Create your first rating configuration to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {configs.map((config) => (
          <Card key={config.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{config.name}</CardTitle>
                    {config.is_active && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  {config.description && (
                    <CardDescription>{config.description}</CardDescription>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created {format(new Date(config.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!config.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivateClick(config.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(config.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(config.id)}
                    disabled={config.is_active || isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Task Ratings</div>
                  <div className="font-medium">
                    {config.config.task_ratings.enabled ? '✓ Enabled' : '✗ Disabled'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Stakeholder</div>
                  <div className="font-medium">
                    {config.config.stakeholder_ratings.enabled ? '✓ Enabled' : '✗ Disabled'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Help (Helper)</div>
                  <div className="font-medium">
                    {config.config.help_requests_helper.enabled ? '✓ Enabled' : '✗ Disabled'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Help (Requester)</div>
                  <div className="font-medium">
                    {config.config.help_requests_requester.enabled ? '✓ Enabled' : '✗ Disabled'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Tickets</div>
                  <div className="font-medium">
                    {config.config.tickets_resolved.enabled ? '✓ Enabled' : '✗ Disabled'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this configuration. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      {configToEdit && (
        <EditConfigDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          configId={configToEdit}
        />
      )}
    </>
  );
};

export default ConfigList;
