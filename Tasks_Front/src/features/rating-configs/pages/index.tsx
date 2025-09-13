import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRatingConfigs } from '../hooks/useRatingConfigs'
import { useFiltersStore } from '../../../stores/filtersStore'
import RatingConfigsList from '../components/RatingConfigsList'
import { Plus, Search, Settings, CheckCircle2, Clock, Database } from 'lucide-react'

const RatingConfigsPage: React.FC = () => {
  const { 
    ratingConfigs, 
    isLoading, 
    deleteRatingConfig, 
    activateRatingConfig,
    fetchRatingConfigsByType
  } = useRatingConfigs()
  const { searchQuery, setSearchQuery } = useFiltersStore()

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this rating configuration?')) {
      await deleteRatingConfig(id)
    }
  }

  const handleActivate = async (id: number) => {
    await activateRatingConfig(id)
  }

  const handleTabChange = async (value: string) => {
    if (value === 'all') {
      // Fetch all configs logic is handled by the hook
    } else {
      await fetchRatingConfigsByType(value)
    }
  }

  // Calculate stats
  const activeConfigs = ratingConfigs.filter(c => c.is_active).length
  const taskRatingConfigs = ratingConfigs.filter(c => c.type === 'task_rating').length
  const stakeholderRatingConfigs = ratingConfigs.filter(c => c.type === 'stakeholder_rating').length
  const finalRatingConfigs = ratingConfigs.filter(c => c.type === 'final_rating').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans">Rating Configurations</h1>
            <p className="text-muted-foreground">Manage rating system configurations</p>
          </div>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to="/rating-configs/create">
            <Plus className="mr-2 h-4 w-4" />
            New Configuration
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search configurations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-input text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Configurations
            </CardTitle>
            <Database className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{ratingConfigs.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeConfigs}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Task Rating
            </CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{taskRatingConfigs}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Final Rating
            </CardTitle>
            <Settings className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{finalRatingConfigs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4" onValueChange={handleTabChange}>
        <TabsList className="bg-muted">
          <TabsTrigger value="all">All ({ratingConfigs.length})</TabsTrigger>
          <TabsTrigger value="task_rating">Task Rating ({taskRatingConfigs})</TabsTrigger>
          <TabsTrigger value="stakeholder_rating">Stakeholder ({stakeholderRatingConfigs})</TabsTrigger>
          <TabsTrigger value="final_rating">Final Rating ({finalRatingConfigs})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <RatingConfigsList 
            ratingConfigs={ratingConfigs} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onActivate={handleActivate}
          />
        </TabsContent>
        
        <TabsContent value="task_rating">
          <RatingConfigsList 
            ratingConfigs={ratingConfigs.filter(c => c.type === 'task_rating')} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onActivate={handleActivate}
          />
        </TabsContent>
        
        <TabsContent value="stakeholder_rating">
          <RatingConfigsList 
            ratingConfigs={ratingConfigs.filter(c => c.type === 'stakeholder_rating')} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onActivate={handleActivate}
          />
        </TabsContent>
        
        <TabsContent value="final_rating">
          <RatingConfigsList 
            ratingConfigs={ratingConfigs.filter(c => c.type === 'final_rating')} 
            isLoading={isLoading} 
            onDelete={handleDelete}
            onActivate={handleActivate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RatingConfigsPage
