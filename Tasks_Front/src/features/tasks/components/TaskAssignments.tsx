import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, Users, AlertCircle, Edit2, Check } from 'lucide-react'
import type { TaskWithAssignments } from '../../../types/TaskAssignment'
import type { User } from '../../../types/User'

interface TaskAssignmentsProps {
  taskWithAssignments: TaskWithAssignments | null
  availableUsers: User[]
  onAddUser: (userId: number, percentage: number) => Promise<boolean>
  onUpdateAssignment: (userId: number, percentage: number) => Promise<boolean>
  onRemoveUser: (userId: number) => Promise<boolean>
  isLoading?: boolean
}

const TaskAssignments: React.FC<TaskAssignmentsProps> = ({
  taskWithAssignments,
  availableUsers,
  onAddUser,
  onUpdateAssignment,
  onRemoveUser,
  isLoading = false
}) => {
  // hooks – always run, regardless of props
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [percentage, setPercentage] = useState<number>(10)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editPercentage, setEditPercentage] = useState<number>(0)

  // safely handle "no data" case
  if (!taskWithAssignments) {
    return null
  }

  const assignedUsers = taskWithAssignments.assigned_users || []
  const assignedUserIds = assignedUsers.map(u => u.id)
  const unassignedUsers = availableUsers.filter(u => !assignedUserIds.includes(u.id))

  // no useMemo – just compute directly
  const totalAssigned = assignedUsers.reduce(
    (sum, user) => sum + (Number(user.pivot?.percentage) || 0),
    0
  )
  const isFullyAssigned = totalAssigned >= 100
  const remainingPercentage = 100 - totalAssigned

  const handleAddUser = async () => {
    if (!selectedUserId || percentage <= 0) return

    const success = await onAddUser(Number(selectedUserId), percentage)
    if (success) {
      setSelectedUserId('')
      setPercentage(10)
      setShowAddForm(false)
    }
  }

  const startEdit = (userId: number, currentPercentage: number) => {
    setEditingUserId(userId)
    setEditPercentage(currentPercentage)
  }

  const saveEdit = async (userId: number) => {
    if (editPercentage <= 0 || editPercentage > 100) return
    await onUpdateAssignment(userId, editPercentage)
    setEditingUserId(null)
  }

  const cancelEdit = () => {
    setEditingUserId(null)
  }
  return (
    <Card className="bg-card border-border w-full">
      <CardHeader className="p-4 pb-3">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-foreground flex items-center gap-1.5 text-base">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Assignments</span>
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-semibold flex-shrink-0">
              {assignedUsers.length}
            </Badge>
          </div>
          
          {/* Compact Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{totalAssigned}%</span>
              <Badge 
                variant={totalAssigned === 100 ? "default" : totalAssigned > 100 ? "destructive" : "outline"}
                className="text-xs h-5"
              >
                {remainingPercentage}% left
              </Badge>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  totalAssigned > 100 
                    ? 'bg-destructive' 
                    : totalAssigned === 100 
                    ? 'bg-chart-3' 
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(totalAssigned, 100)}%` }}
              />
            </div>
          </div>

          {/* Add Button */}
          {unassignedUsers.length > 0 && !showAddForm && (
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="w-full h-8 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={remainingPercentage <= 0}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Assign User
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-2.5">
        {/* Compact Add Form */}
        {showAddForm && (
          <div className="p-3 border border-primary/30 rounded-md bg-primary/5 space-y-2.5">
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                {unassignedUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()} className="text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(Number(e.target.value))}
                min="1"
                max={remainingPercentage}
                className="h-8 text-xs flex-1"
                placeholder="%"
              />
              <span className="text-xs text-muted-foreground font-medium">%</span>
            </div>

            {percentage > remainingPercentage && remainingPercentage > 0 && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>Max {remainingPercentage}%</span>
              </div>
            )}

            <div className="flex gap-1.5">
              <Button 
                size="sm" 
                onClick={handleAddUser}
                disabled={!selectedUserId || percentage <= 0 || percentage > remainingPercentage}
                className="flex-1 h-7 text-xs"
              >
                Add
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setShowAddForm(false)
                  setSelectedUserId('')
                  setPercentage(10)
                }}
                className="flex-1 h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Compact Users List */}
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-14 bg-muted/50 animate-pulse rounded-md" />
            ))}
          </div>
        ) : assignedUsers.length === 0 ? (
          <div className="text-center py-8 px-2">
            <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium text-foreground">No users assigned</p>
            <p className="text-xs text-muted-foreground mt-0.5">Click above to assign</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[350px] pr-2">
            <div className="space-y-1.5">
              {assignedUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-2 p-2.5 border border-border rounded-md hover:border-primary/40 hover:bg-accent/20 transition-colors group"
                >
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    {typeof user.avatar_url === 'string' && user.avatar_url.trim() !== '' && (
                      <AvatarImage src={user.avatar_url} alt={user.name || 'User'} />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate leading-tight">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {editingUserId === user.id ? (
                        <span className="text-primary">Editing...</span>
                      ) : (
                        `${user.pivot.percentage}%`
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {editingUserId === user.id ? (
                      <>
                        <Input
                          type="number"
                          value={editPercentage}
                          onChange={(e) => setEditPercentage(Number(e.target.value))}
                          min="1"
                          max="100"
                          className="w-12 h-6 text-xs p-1 text-center"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveEdit(user.id)}
                          className="h-6 w-6 p-0 text-chart-3"
                          title="Save"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="h-6 w-6 p-0"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(user.id, user.pivot.percentage)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          title="Edit percentage"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onRemoveUser(user.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {/* Status Warning/Success */}
        {assignedUsers.length > 0 && (
          <div className="pt-2 space-y-1.5">
            {totalAssigned > 100 && (
              <div className="flex items-start gap-1.5 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive leading-tight">
                  Over by {totalAssigned - 100}%
                </p>
              </div>
            )}
            
            {isFullyAssigned && (
              <div className="flex items-center gap-1.5 p-2 bg-chart-3/10 border border-chart-3/20 rounded-md">
                <Check className="w-3.5 h-3.5 text-chart-3 flex-shrink-0" />
                <p className="text-xs text-chart-3 font-medium">
                  Fully assigned
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TaskAssignments
