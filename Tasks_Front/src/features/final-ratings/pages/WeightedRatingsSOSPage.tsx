// pages/WeightedRatingsSOSPage.tsx
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, Calculator, Loader2, RefreshCw } from 'lucide-react'
import { apiClient } from '@/services/api'

type SosRow = { user_name: string; rating: number | null }
type MaybeWrapped<T> = T | { data: T } // handles both raw array and { data: ... }

const WeightedRatingsSOSPage: React.FC = () => {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SosRow[] | null>(null)

  const hardcodedUserIds = [1, 4, 5, 6]

  const extractPayload = <T,>(resp: MaybeWrapped<T>): T =>
    (resp as any)?.data ? (resp as any).data as T : (resp as T)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!start || !end) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // `/services/api.ts` already applies baseURL and token headers
      const resp = await apiClient.post<SosRow[]>('/calculate-weighted-ratings-sos', {
        user_ids: hardcodedUserIds,
        start_date: start,
        end_date: end,
      })

      const payload = extractPayload<SosRow[]>(resp)
      setResults(payload)
      // optional scroll to table
      setTimeout(() => {
        document.getElementById('sos-results-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const clearAll = () => {
    setStart('')
    setEnd('')
    setError(null)
    setResults(null)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 space-y-6 p-4 md:p-6 max-w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-sans">Weighted Ratings (SOS)</h1>
              <p className="text-muted-foreground">
                Latest task rating × user percentage, averaged per user (out of 100)
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={clearAll}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Form + Results */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Calculate Weighted Ratings (SOS)
            </CardTitle>
            <CardDescription>Hardcoded users: 1, 4, 5, 6</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  min={start}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate
                  </>
                )}
              </Button>
            </form>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-md p-3">
                {error}
              </div>
            )}

            {/* Results Table */}
            {results && (
              <div id="sos-results-table" className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">#</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Rating (out of 100)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row, idx) => (
                      <TableRow key={`${row.user_name}-${idx}`}>
                        <TableCell className="font-medium">{idx + 1}</TableCell>
                        <TableCell>{row.user_name}</TableCell>
                        <TableCell className="text-right">
                          {row.rating === null ? '—' : row.rating.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!results && !error && (
              <div className="text-sm text-muted-foreground">
                Choose a date range and click <span className="font-medium">Calculate</span> to see ratings.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default WeightedRatingsSOSPage
