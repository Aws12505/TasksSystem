// features/finalRatings/components/RatingResults.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp, Calendar, TrendingUp, FileText, Loader2 } from 'lucide-react';
import type { FinalRatingResponse } from '../../../types/FinalRating';
import { format } from 'date-fns';
import UserRatingDetail from './UserRatingDetail';
import { useFinalRatings } from '../hooks/useFinalRatings';

interface RatingResultsProps {
  result: FinalRatingResponse;
}

const RatingResults: React.FC<RatingResultsProps> = ({ result }) => {
  const [expandedUser, setExpandedUser] = useState<number | null>(null);
  const { exportPdf, isExporting } = useFinalRatings();

  const toggleUserExpand = (userId: number) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };



  const handleExportPdf = () => {
    exportPdf({
      period_start: result.period.start,
      period_end: result.period.end,
      max_points: result.max_points_for_100_percent,
      config_id: result.config.id,
    });
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!result) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">No results to display</div>
        </CardContent>
      </Card>
    );
  }

  if (!result.users || result.users.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">No employees found in this period</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Rating Results
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(result.period.start), 'MMM d, yyyy')} -{' '}
                {format(new Date(result.period.end), 'MMM d, yyyy')}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportPdf} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Total Employees</div>
              <div className="text-2xl font-bold">{result.users.length}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Config Used</div>
              <div className="text-lg font-medium">{result.config.name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Max Points for 100%</div>
              <div className="text-2xl font-bold">{result.max_points_for_100_percent}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-3">
        {result.users
          .sort((a, b) => b.final_percentage - a.final_percentage)
          .map((user) => (
            <Card key={user.user_id} className="bg-card border-border">
              <CardHeader className="cursor-pointer" onClick={() => toggleUserExpand(user.user_id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.user_name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(user.user_name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{user.user_name}</CardTitle>
                        <Badge variant="outline" className={getPercentageColor(user.final_percentage)}>
                          {user.final_percentage}%
                        </Badge>
                      </div>
                      <CardDescription>{user.user_email}</CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Points</div>
                      <div className="text-lg font-bold">
                        {user.total_points} / {user.max_points}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedUser === user.user_id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={user.final_percentage} className="h-2" />
                </div>
              </CardHeader>

              {expandedUser === user.user_id && (
                <CardContent className="pt-0">
                  <UserRatingDetail user={user} />
                </CardContent>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
};

export default RatingResults;
