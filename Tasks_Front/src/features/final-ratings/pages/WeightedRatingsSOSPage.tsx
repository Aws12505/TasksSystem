// pages/WeightedRatingsSOSPage.tsx
import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Calculator, Loader2, RefreshCw, ArrowUpDown } from 'lucide-react'
import { apiClient } from '@/services/api'

type SosRow = { user_name: string; rating: number | null }
type MaybeWrapped<T> = T | { data: T } // handles both raw array and { data: ... }

const WeightedRatingsSOSPage: React.FC = () => {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SosRow[] | null>(null)
  const [desc, setDesc] = useState(true) // sort by highest first

  const hardcodedUserIds = [1, 4, 5, 6]

  const extractPayload = <T,>(resp: MaybeWrapped<T>): T =>
    (resp as any)?.data ? ((resp as any).data as T) : (resp as T)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!start || !end) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // uses your Axios client (baseURL + token)
      const resp = await apiClient.post<SosRow[]>('final-ratings/calculate-weighted-ratings-sos', {
        user_ids: hardcodedUserIds,
        start_date: start,
        end_date: end,
      })

      const payload = extractPayload<SosRow[]>(resp)
      setResults(payload)
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

  const sorted = useMemo(() => {
    if (!results) return null
    const toNumber = (r: number | null) => (typeof r === 'number' ? r : -Infinity) // nulls go to bottom
    const arr = [...results].sort((a, b) => (desc ? toNumber(b.rating) - toNumber(a.rating) : toNumber(a.rating) - toNumber(b.rating)))
    return arr
  }, [results, desc])

  const summary = useMemo(() => {
    if (!results || results.length === 0) return null
    const valid = results.filter(r => typeof r.rating === 'number') as { user_name: string; rating: number }[]
    if (valid.length === 0) return { avg: null, top: null }
    const sum = valid.reduce((acc, r) => acc + r.rating, 0)
    const avg = +(sum / valid.length).toFixed(2)
    const top = valid.reduce((best, r) => (r.rating > best.rating ? r : best), valid[0])
    return { avg, top }
  }, [results])

  const barIntent = (val: number | null) => {
    if (val === null) return 'bg-muted'
    if (val >= 85) return 'bg-green-500'
    if (val >= 70) return 'bg-blue-500'
    if (val >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
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
              <p className="text-muted-foreground">Latest task rating × user percentage, averaged per user (out of 100)</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDesc(d => !d)}>
              <ArrowUpDown className="w-4 h-4 mr-2" />
              {desc ? 'Highest → Lowest' : 'Lowest → Highest'}
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
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

            {/* Quick Summary */}
            {sorted && summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-muted/40 border border-border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Users Calculated</div>
                  <div className="text-2xl font-semibold">{sorted.length}</div>
                </div>
                <div className="bg-muted/40 border border-border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Average Rating</div>
                  <div className="text-2xl font-semibold">
                    {summary.avg === null ? '—' : summary.avg}
                  </div>
                </div>
                <div className="bg-muted/40 border border-border rounded-lg p-3">
                  <div className="text-xs text-muted-foreground">Top Performer</div>
                  <div className="text-sm font-medium">
                    {summary.top ? `${summary.top.user_name} • ${summary.top.rating.toFixed(2)}` : '—'}
                  </div>
                </div>
              </div>
            )}

            {/* Results Table */}
            {sorted && (
              <div id="sos-results-table" className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[70px]">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                      <TableHead className="w-[240px]">Progress</TableHead>
                      <TableHead className="text-right w-[120px]">Badge</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((row, idx) => {
                      const r = row.rating
                      const isTop3 = idx < 3 && typeof r === 'number'
                      return (
                        <TableRow key={`${row.user_name}-${idx}`} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{row.user_name}</TableCell>
                          <TableCell className="text-right tabular-nums">{r === null ? '—' : r.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <Progress value={typeof r === 'number' ? Math.max(0, Math.min(100, r)) : 0} className="h-2" />
                              </div>
                              <div className={`h-2 w-2 rounded-full ${barIntent(r)}`} />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {isTop3 ? (
                              <Badge variant="secondary">{idx === 0 ? '🏆 Top 1' : idx === 1 ? '🥈 Top 2' : '🥉 Top 3'}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
