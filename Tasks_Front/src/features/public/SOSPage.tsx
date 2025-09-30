import { useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Import react-datepicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Define types
interface UserRating {
  user_name: string;
  rating: number | null;
}

interface ApiResponse {
  user_name: string;
  rating: number | null;
}

interface ErrorResponse {
  message?: string;
}

const UserRatingsPage = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // User IDs to fetch ratings for
  const userIds = [1, 4, 5, 6];

  const fetchRatings = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<ApiResponse[]>('/api/task-ratings/calculate', {
        user_ids: userIds,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });

      setRatings(response.data);
    } catch (err) {
      if (axios.isAxiosError<ErrorResponse>(err)) {
        setError(err.response?.data?.message || 'Failed to fetch ratings');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRatingBadge = (rating: number | null) => {
    if (rating === null) {
      return <Badge variant="secondary">No Data</Badge>;
    }
    if (rating >= 80) {
      return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
    }
    if (rating >= 60) {
      return <Badge variant="default" className="bg-blue-500">Good</Badge>;
    }
    if (rating >= 40) {
      return <Badge variant="default" className="bg-yellow-500">Fair</Badge>;
    }
    return <Badge variant="destructive">Poor</Badge>;
  };

  const getRatingColor = (rating: number | null): string => {
    if (rating === null) return 'text-gray-500';
    if (rating >= 80) return 'text-green-600 font-semibold';
    if (rating >= 60) return 'text-blue-600 font-semibold';
    if (rating >= 40) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">User Performance Ratings</CardTitle>
          <CardDescription>
            View weighted average ratings for users based on task completions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Date Range Selector */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholderText="Select start date"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                dateFormat="yyyy-MM-dd"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholderText="Select end date"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={fetchRatings}
                disabled={loading || !startDate || !endDate}
                className="w-full md:w-auto"
              >
                {loading ? 'Loading...' : 'Fetch Ratings'}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Ratings Table */}
          {ratings.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableCaption>
                  Performance ratings from {startDate && format(startDate, 'MMM dd, yyyy')} to{' '}
                  {endDate && format(endDate, 'MMM dd, yyyy')}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>User Name</TableHead>
                    <TableHead className="text-center">Rating (out of 100)</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium text-lg">
                        {user.user_name}
                      </TableCell>
                      <TableCell className={cn('text-center text-xl', getRatingColor(user.rating))}>
                        {user.rating !== null ? user.rating.toFixed(2) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {getRatingBadge(user.rating)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty State */}
          {!loading && ratings.length === 0 && startDate && endDate && !error && (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg">No ratings found for the selected date range</p>
              <p className="text-sm">Try selecting a different date range</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRatingsPage;
