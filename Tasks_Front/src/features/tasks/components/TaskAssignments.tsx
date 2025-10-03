import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, X, Users } from 'lucide-react'
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
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [percentage, setPercentage] = useState<number>(10)

  if (!taskWithAssignments) {
    return null
  }

  const assignedUsers = taskWithAssignments.assigned_users || []
  const assignedUserIds = assignedUsers.map(u => u.id)
  const unassignedUsers = availableUsers.filter(u => !assignedUserIds.includes(u.id))
  const totalAssigned = taskWithAssignments.total_assigned_percentage || 0
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

  const handleUpdatePercentage = async (userId: number, newPercentage: number) => {
    if (newPercentage <= 0 || newPercentage > 100) return
    await onUpdateAssignment(userId, newPercentage)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Task Assignments ({assignedUsers.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {totalAssigned}% assigned
            </Badge>
            {unassignedUsers.length > 0 && (
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={remainingPercentage <= 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                Assign User
              </Button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(totalAssigned, 100)}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add User Form */}
        {showAddForm && (
          <div className="p-4 border border-border rounded-lg bg-accent/20">
            <h4 className="text-sm font-medium text-foreground mb-3">Assign User to Task</h4>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">Select User</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24">
                <label className="text-xs text-muted-foreground">Percentage</label>
                <Input
                  type="number"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  min="1"
                  max={remainingPercentage}
                  className="bg-background border-input text-foreground"
                />
              </div>
              <Button 
                size="sm" 
                onClick={handleAddUser}
                disabled={!selectedUserId || percentage <= 0 || percentage > remainingPercentage}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Add
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
            {remainingPercentage < percentage && (
              <p className="text-xs text-destructive mt-2">
                Only {remainingPercentage}% remaining to assign
              </p>
            )}
          </div>
        )}

        {/* Assigned Users List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : assignedUsers.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No users assigned to this task yet.
          </p>
        ) : (
          assignedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  {typeof user.avatar_url === 'string' && user.avatar_url.trim() !== '' && (
              <AvatarImage
              src={user.avatar_url}
              alt={user.name || 'User avatar'}
              className="object-cover"
              />
              )}
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-20">
                  <Input
                    type="number"
                    value={user.pivot.percentage}
                    onChange={(e) => handleUpdatePercentage(user.id, Number(e.target.value))}
                    min="1"
                    max="100"
                    className="text-xs h-8 bg-background border-input text-foreground"
                  />
                </div>
                <span className="text-xs text-muted-foreground">%</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveUser(user.id)}
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
        
        {/* Assignment Status */}
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Total Assigned:</span>
            <span className={`font-medium ${
              taskWithAssignments.is_fully_assigned 
                ? 'text-chart-3' 
                : totalAssigned > 100 
                ? 'text-destructive' 
                : 'text-muted-foreground'
            }`}>
              {totalAssigned}%
            </span>
          </div>
          {totalAssigned > 100 && (
            <p className="text-xs text-destructive mt-1">
              Task is over-assigned. Please adjust percentages.
            </p>
          )}
          {taskWithAssignments.is_fully_assigned && (
            <p className="text-xs text-chart-3 mt-1">
              Task is fully assigned.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskAssignments
