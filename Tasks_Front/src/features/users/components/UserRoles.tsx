import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Save, Loader2 } from 'lucide-react'
import type { Role } from '../../../types/Role'

interface UserRolesProps {
  userRoles: Role[]
  availableRoles: Role[]
  onSave: (roleNames: string[]) => Promise<boolean>
  isLoading?: boolean
}

const UserRoles: React.FC<UserRolesProps> = ({ 
  userRoles, 
  availableRoles, 
  onSave, 
  isLoading = false 
}) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    userRoles.map(role => role.name)
  )
  const [saving, setSaving] = useState(false)

  const handleRoleChange = (roleName: string, checked: boolean) => {
    setSelectedRoles(prev => 
      checked 
        ? [...prev, roleName]
        : prev.filter(name => name !== roleName)
    )
  }

  const handleSave = async () => {
    setSaving(true)
    const success = await onSave(selectedRoles)
    if (success) {
      // Updated roles will be fetched by parent component
    }
    setSaving(false)
  }

  const hasChanges = JSON.stringify(selectedRoles.sort()) !== 
    JSON.stringify(userRoles.map(r => r.name).sort())

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Roles</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selectedRoles.length} selected
            </Badge>
            {hasChanges && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                <Save className="mr-1 h-3 w-3" />
                Save
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {availableRoles.map((role) => (
              <div key={role.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.name)}
                  onCheckedChange={(checked) => 
                    handleRoleChange(role.name, checked as boolean)
                  }
                  disabled={saving}
                />
                <label 
                  htmlFor={`role-${role.id}`} 
                  className="text-sm text-foreground cursor-pointer flex-1"
                >
                  <div>
                    <p className="font-medium">{role.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {role.permissions.length} permissions
                    </p>
                  </div>
                </label>
              </div>
            ))}
            {availableRoles.length === 0 && (
              <p className="text-muted-foreground text-sm">No roles available</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UserRoles
