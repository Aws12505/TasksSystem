import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFiltersStore } from '../../../stores/filtersStore'
import { Search, RotateCcw } from 'lucide-react'

const DashboardFilters: React.FC = () => {
  const { 
    dateRange, 
    searchQuery, 
    setDateRange, 
    setSearchQuery, 
    resetFilters 
  } = useFiltersStore()

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value ? new Date(e.target.value) : null
    setDateRange({ start: startDate, end: dateRange.end })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value ? new Date(e.target.value) : null
    setDateRange({ start: dateRange.start, end: endDate })
  }

  return (
    <Card className="mb-6 bg-card border-border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={handleStartDateChange}
              className="w-40 bg-background border-input text-foreground"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={handleEndDateChange}
              className="w-40 bg-background border-input text-foreground"
            />
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetFilters}
              className="border-border hover:bg-accent hover:text-accent-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DashboardFilters
