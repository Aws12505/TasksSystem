import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Save, Loader2, Search } from 'lucide-react'
import type { Role } from '../../../types/Role'
import type { Permission } from '../../../types/Permission'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface RolePermissionsProps {
  role: Role
  availablePermissions: Permission[]
  onSave: (roleId: number, data: { name: string; permissions: string[] }) => Promise<Role | null>
  isLoading?: boolean
}

const RolePermissions: React.FC<RolePermissionsProps> = ({
  role,
  availablePermissions,
  onSave,
  isLoading = false
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role.permissions?.map(permission => permission.name) || []
  )
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Update selected permissions when role changes
  useEffect(() => {
    setSelectedPermissions(role.permissions?.map(permission => permission.name) || [])
  }, [role])

  const handlePermissionChange = (permissionName: string, checked: boolean) => {
    setSelectedPermissions(prev =>
      checked ? [...prev, permissionName] : prev.filter(name => name !== permissionName)
    )
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave(role.id, {
      name: role.name,
      permissions: selectedPermissions
    })
    setSaving(false)
  }

  const filteredPermissions = availablePermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const hasChanges =
    JSON.stringify([...selectedPermissions].sort()) !==
    JSON.stringify((role.permissions?.map(p => p.name) || []).sort())

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground">Role Permissions</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selectedPermissions.length} selected
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-input text-foreground"
          />
        </div>
      </CardHeader>

      {/* Remove padding here so the scrollbar can align with the card edge */}
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          // Make the ScrollArea the height owner; this prevents the list from pushing the card
          <ScrollArea className="h-64">
            {/* Put padding inside the scroller; pr-6 so text doesn't sit under the rail */}
            <div className="space-y-3 p-4 pr-6">
              {filteredPermissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.name)}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.name, checked as boolean)
                    }
                    disabled={saving}
                  />
                  <label
                    htmlFor={`permission-${permission.id}`}
                    className="text-sm text-foreground cursor-pointer flex-1"
                  >
                    {permission.name}
                  </label>
                </div>
              ))}

              {filteredPermissions.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'No permissions found matching your search' : 'No permissions available'}
                </p>
              )}
            </div>

            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

export default RolePermissions
