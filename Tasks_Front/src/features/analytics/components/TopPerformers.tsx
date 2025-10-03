import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award } from 'lucide-react'
import type { TopPerformer } from '../../../types/Analytics'

interface TopPerformersProps {
  topPerformers: TopPerformer[]
  title?: string
}

const TopPerformers: React.FC<TopPerformersProps> = ({ 
  topPerformers, 
  title = "Top Performers" 
}) => {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">
          {index + 1}
        </div>
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-yellow-600 bg-yellow-100'
      case 1:
        return 'text-gray-600 bg-gray-100'
      case 2:
        return 'text-amber-600 bg-amber-100'
      default:
        return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topPerformers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No performance data available
          </div>
        ) : (
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getRankIcon(index)}
                  <Avatar className="w-8 h-8">
                    {typeof performer.avatar_url === 'string' && performer.avatar_url.trim() !== '' && (
              <AvatarImage
              src={performer.avatar_url}
              alt={performer.name || 'User avatar'}
              className="object-cover"
              />
              )}
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {performer.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{performer.name}</p>
                    <p className="text-xs text-muted-foreground">{performer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getRankColor(index)}>
                    {performer.avg_final_rating}%
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {performer.periods_rated} periods
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TopPerformers
