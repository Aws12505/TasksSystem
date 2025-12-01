// pages/WeightedRatingsSOSPage.tsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Check,
  TrendingUp,
  Calculator,
  Loader2,
  RefreshCw,
  ArrowUpDown,
  X,
  Users,
  Trophy,
  Medal,
  Award,
  ChevronsUpDown,
} from 'lucide-react'
import { apiClient } from '@/services/api'
import { CalendarWithInput } from '@/components/ui/calendar-with-input'
import { userService } from '@/services/userService'
import type { User } from '@/types/User'

type SosRow = { user_name: string; rating: number | null }
type MaybeWrapped<T> = T | { data: T }

const WeightedRatingsSOSPage: React.FC = () => {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [loading, setLoading] = useState(false)
  const [usersLoading, setUsersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SosRow[] | null>(null)
  const [desc, setDesc] = useState(true)

  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [userSelectOpen, setUserSelectOpen] = useState(false)

  const extractPayload = <T,>(resp: MaybeWrapped<T>): T =>
    (resp as any)?.data ? ((resp as any).data as T) : (resp as T)

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setUsersLoading(true)
      try {
        const users = await userService.getAllUsers()
        setAvailableUsers(users)
      } catch (e) {
        console.error('Failed to fetch users:', e)
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const toggleUser = (id: number) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const clearAll = () => {
    setStart('')
    setEnd('')
    setSelectedUserIds([])
    setError(null)
    setResults(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!start || !end || selectedUserIds.length === 0) return

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const resp = await apiClient.post<SosRow[]>(
        'final-ratings/calculate-weighted-ratings-sos',
        {
          user_ids: selectedUserIds,
          start_date: start,
          end_date: end,
        }
      )

      const payload = extractPayload<SosRow[]>(resp as any)
      setResults(payload)

      setTimeout(() => {
        document
          .getElementById('sos-results-table')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 0)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const sorted = useMemo(() => {
    if (!results) return null
    const toNumber = (r: number | null) =>
      typeof r === 'number' ? r : -Infinity
    return [...results].sort((a, b) =>
      desc
        ? toNumber(b.rating) - toNumber(a.rating)
        : toNumber(a.rating) - toNumber(b.rating)
    )
  }, [results, desc])

  const summary = useMemo(() => {
    if (!results || results.length === 0) return null
    const valid = results.filter(r => typeof r.rating === 'number') as {
      user_name: string
      rating: number
    }[]
    if (valid.length === 0) return { avg: null, top: null }
    const sum = valid.reduce((acc, r) => acc + r.rating, 0)
    const avg = +(sum / valid.length).toFixed(2)
    const top = valid.reduce(
      (best, r) => (r.rating > best.rating ? r : best),
      valid[0]
    )
    return { avg, top }
  }, [results])

  const barIntent = (val: number | null) => {
    if (val === null) return 'bg-muted'
    if (val >= 85) return 'bg-green-500'
    if (val >= 70) return 'bg-blue-500'
    if (val >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const selectedUsers = availableUsers.filter(u =>
    selectedUserIds.includes(u.id)
  )

  // Find user by name for avatars in results
  const getUserByName = (name: string) => {
    const n = name.trim().toLowerCase()
    return (
      availableUsers.find(u => u.name?.trim().toLowerCase() === n) ||
      availableUsers.find(u => (u as any).user_name?.trim().toLowerCase() === n) ||
      null
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  Weighted Ratings (SOS)
                </h1>
                <p className="text-muted-foreground mt-2">
                  Latest task rating × user percentage, averaged per user (out of 100)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDesc(d => !d)}
                className="gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                {desc ? 'Descending' : 'Ascending'}
              </Button>
              <Button variant="outline" onClick={clearAll} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Form + Results */}
        <div className="space-y-8">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calculator className="w-5 h-5" />
                Calculate Weighted Ratings
              </CardTitle>
              <CardDescription>
                Select users and date range to calculate weighted SOS ratings
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Selected Users Display */}
              {selectedUsers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Selected Users ({selectedUsers.length})
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUserIds([])}
                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-muted/20">
                    {selectedUsers.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-full hover:border-primary/50 transition-colors"
                      >
                        <Avatar className="w-6 h-6">
                          {user.avatar_url?.trim() ? (
                            <AvatarImage src={user.avatar_url} alt={user.name} />
                          ) : null}
                          <AvatarFallback className="text-[10px] bg-primary/10">
                            {user.name?.[0]?.toUpperCase() ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium truncate max-w-[140px]">
                          {user.name}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-5 w-5 p-0 ml-1 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => toggleUser(user.id)}
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Users Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="user-select" className="text-sm font-medium">
                      Select Users *
                    </Label>
                    <Popover open={userSelectOpen} onOpenChange={setUserSelectOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="user-select"
                          type="button"
                          variant="outline"
                          className="w-full justify-between h-11"
                          disabled={usersLoading}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">
                              {usersLoading
                                ? 'Loading users...'
                                : selectedUserIds.length === 0
                                ? 'Select users...'
                                : `${selectedUserIds.length} user${selectedUserIds.length !== 1 ? 's' : ''} selected`}
                            </span>
                          </div>
                          <ChevronsUpDown className="w-4 h-4 opacity-60 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[340px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search users..." />
                          <CommandEmpty>No users found</CommandEmpty>
                          <CommandGroup>
                            <ScrollArea className="h-[300px]">
                              {availableUsers.map(user => {
                                const selected = selectedUserIds.includes(user.id)
                                return (
                                  <CommandItem
                                    key={user.id}
                                    onSelect={() => toggleUser(user.id)}
                                    className="flex items-center justify-between gap-2 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <Avatar className="w-8 h-8">
                                        {user.avatar_url?.trim() ? (
                                          <AvatarImage src={user.avatar_url} alt={user.name} />
                                        ) : null}
                                        <AvatarFallback className="text-xs">
                                          {user.name?.[0]?.toUpperCase() ?? 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate">
                                          {user.name}
                                        </span>
                                        {user.email && (
                                          <span className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {selected && (
                                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                    )}
                                  </CommandItem>
                                )
                              })}
                            </ScrollArea>
                          </CommandGroup>
                        </Command>
                        <div className="border-t p-3 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            className="flex-1"
                            onClick={() => setSelectedUserIds(availableUsers.map(u => u.id))}
                            disabled={availableUsers.length === 0}
                          >
                            Select all
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            className="flex-1"
                            onClick={() => setSelectedUserIds([])}
                            disabled={selectedUserIds.length === 0}
                          >
                            Clear
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Dates */}
                  <div className="space-y-3">
                    <Label htmlFor="start_date" className="text-sm font-medium">
                      Start Date *
                    </Label>
                    <CalendarWithInput
                      id="start_date"
                      name="start_date"
                      value={start}
                      onChange={setStart}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="end_date" className="text-sm font-medium">
                      End Date *
                    </Label>
                    <CalendarWithInput
                      id="end_date"
                      name="end_date"
                      value={end}
                      onChange={setEnd}
                      required
                      min={start}
                      className="h-11"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    {selectedUserIds.length === 0
                      ? 'Pick at least one user to calculate.'
                      : `Ready to calculate for ${selectedUserIds.length} user(s).`}
                  </p>

                  <Button
                    type="submit"
                    size="lg"
                    className="px-8"
                    disabled={loading || usersLoading || selectedUserIds.length === 0 || !start || !end}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Calculator className="w-4 h-4 mr-2" />
                        Calculate Ratings
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <X className="w-4 h-4" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Results */}
              {sorted && (
                <div className="space-y-6">
                  {/* Summary */}
                  {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-card border-border">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <Users className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Users Calculated</p>
                              <p className="text-3xl font-bold mt-1">{sorted.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-border">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                              <TrendingUp className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Average Rating</p>
                              <p className="text-3xl font-bold mt-1">
                                {summary.avg === null ? '—' : summary.avg.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-card border-border">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/10 rounded-lg">
                              <Trophy className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Top Performer</p>
                              <p className="text-lg font-semibold mt-1 truncate">
                                {summary.top
                                  ? `${summary.top.user_name} • ${summary.top.rating.toFixed(2)}`
                                  : '—'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Table */}
                  <div
                    id="sos-results-table"
                    className="rounded-xl border border-border overflow-hidden shadow-sm"
                  >
                    <div className="bg-muted/30 p-4 border-b">
                      <h3 className="font-semibold text-lg">Results</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sorted by weighted rating {desc ? '(highest first)' : '(lowest first)'}
                      </p>
                    </div>

                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="w-[90px] font-semibold">Rank</TableHead>
                          <TableHead className="font-semibold">User</TableHead>
                          <TableHead className="text-right font-semibold">Rating</TableHead>
                          <TableHead className="w-[300px] font-semibold">Progress</TableHead>
                          <TableHead className="text-right w-[150px] font-semibold">
                            Achievement
                          </TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {sorted.map((row, idx) => {
                          const r = row.rating
                          const isTop3 = idx < 3 && typeof r === 'number'
                          const userObj = getUserByName(row.user_name)

                          return (
                            <TableRow
                              key={`${row.user_name}-${idx}`}
                              className="hover:bg-muted/20"
                            >
                              {/* Rank */}
                              <TableCell className="font-medium">
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                                    isTop3
                                      ? 'bg-primary/10 text-primary font-bold'
                                      : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {idx + 1}
                                </span>
                              </TableCell>

                              {/* User with avatar */}
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar className="w-8 h-8">
                                    {userObj?.avatar_url?.trim() ? (
                                      <AvatarImage
                                        src={userObj.avatar_url}
                                        alt={userObj.name}
                                      />
                                    ) : null}
                                    <AvatarFallback className="text-xs bg-primary/10">
                                      {(userObj?.name || row.user_name)
                                        ?.charAt(0)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>

                                  <div className="min-w-0">
                                    <div className="font-semibold truncate">
                                      {row.user_name}
                                    </div>
                                    {userObj?.email && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {userObj.email}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>

                              {/* Rating */}
                              <TableCell className="text-right">
                                <div className="tabular-nums font-semibold text-lg">
                                  {r === null ? '—' : r.toFixed(2)}
                                </div>
                              </TableCell>

                              {/* Progress */}
                              <TableCell>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                      {r === null
                                        ? 'No data'
                                        : `${Math.min(100, Math.max(0, r)).toFixed(1)}%`}
                                    </span>
                                    <div className={`h-2 w-2 rounded-full ${barIntent(r)}`} />
                                  </div>
                                  <Progress
                                    value={
                                      typeof r === 'number'
                                        ? Math.max(0, Math.min(100, r))
                                        : 0
                                    }
                                    className="h-2"
                                  />
                                </div>
                              </TableCell>

                              {/* Badge */}
                              <TableCell className="text-right">
                                {isTop3 ? (
                                  <Badge
                                    variant="secondary"
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 ${
                                      idx === 0
                                        ? 'bg-amber-500/20 text-amber-700 border-amber-500/30'
                                        : idx === 1
                                        ? 'bg-slate-500/20 text-slate-700 border-slate-500/30'
                                        : 'bg-orange-500/20 text-orange-700 border-orange-500/30'
                                    }`}
                                  >
                                    {idx === 0 && <Trophy className="w-4 h-4" />}
                                    {idx === 1 && <Medal className="w-4 h-4" />}
                                    {idx === 2 && <Award className="w-4 h-4" />}
                                    <span className="font-semibold">
                                      {idx === 0 ? 'Top 1' : idx === 1 ? 'Top 2' : 'Top 3'}
                                    </span>
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!results && !error && (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-muted/10">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="p-3 bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                      <Calculator className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">No Results Yet</h3>
                    <p className="text-muted-foreground">
                      Select users, choose a date range, and click "Calculate Ratings" to see weighted SOS ratings.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WeightedRatingsSOSPage
