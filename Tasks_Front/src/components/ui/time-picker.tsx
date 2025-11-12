// components/ui/sleek-time-picker.tsx
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Clock, RotateCcw } from "lucide-react"

export type TimeDisplayFormat = "HH:mm" | "HH:mm:ss" | "hh:mm aa" | "hh:mm:ss aa"
type Parts = { h: number; m: number; s: number }

export type SleekTimePickerProps = {
  id?: string
  name?: string
  value?: string
  onChange?: (value: string) => void
  format?: TimeDisplayFormat
  placeholder?: string
  label?: string
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  className?: string
  defaultValue?: string
  autoCloseOnApply?: boolean
  onOpenChange?: (open: boolean) => void
}

const pad2 = (n: number) => String(n).padStart(2, "0")
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const range = (n: number, start = 0) => Array.from({ length: n }, (_, i) => i + start)

const is12h = (fmt?: TimeDisplayFormat) => !!fmt && (fmt.includes("hh") || fmt.includes("aa"))
const showSeconds = (fmt?: TimeDisplayFormat) => !!fmt && fmt.includes(":ss")

const toValue = (p: Parts, withSec: boolean) =>
  `${pad2(p.h)}:${pad2(p.m)}${withSec ? `:${pad2(p.s)}` : ""}`

const toDisplay = (p: Parts | null, fmt?: TimeDisplayFormat) => {
  if (!p) return ""
  const use12 = is12h(fmt)
  const withSec = showSeconds(fmt)
  if (!use12) {
    return `${pad2(p.h)}:${pad2(p.m)}${withSec ? `:${pad2(p.s)}` : ""}`
  }
  const am = p.h < 12
  const hh = p.h % 12 === 0 ? 12 : p.h % 12
  return `${pad2(hh)}:${pad2(p.m)}${withSec ? `:${pad2(p.s)}` : ""} ${am ? "AM" : "PM"}`
}

function parseStrict(v?: string): Parts | null {
  if (!v) return null
  const m = v.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return null
  const h = clamp(+m[1], 0, 23)
  const mi = clamp(+m[2], 0, 59)
  const s = m[3] ? clamp(+m[3], 0, 59) : 0
  return { h, m: mi, s }
}

/** tolerant typing: "930", "9 30 pm", "21:30:45", "123045", etc. */
function parseLoose(input: string, use12: boolean, withSec: boolean): Parts | null {
  const raw = input.trim().toLowerCase()
  if (!raw) return null

  const ampm = raw.match(/\b(am|pm)\b/)?.[1] as "am" | "pm" | undefined
  let cleaned = raw.replace(/\b(am|pm)\b/g, "").replace(/[.,]/g, ":").replace(/\s+/g, " ").trim()

  // compact forms: 930 / 0930 / 123045
  if (/^\d{3,6}$/.test(cleaned)) {
    const s = cleaned
    if (s.length === 3) cleaned = `${s[0]}:${s.slice(1)}`
    else if (s.length === 4) cleaned = `${s.slice(0,2)}:${s.slice(2)}`
    else if (s.length === 5) cleaned = `${s[0]}:${s.slice(1,3)}:${s.slice(3)}`
    else cleaned = `${s.slice(0,2)}:${s.slice(2,4)}:${s.slice(4)}`
  }

  const nums = cleaned.split(/[:\s]/).filter(Boolean).map(Number).filter(n => !Number.isNaN(n))
  if (!nums.length) return null

  let [h, m = 0, s = 0] = nums

  if (use12 || ampm) {
    h = clamp(h, 1, 12)
    let hh = h % 12
    if (ampm === "pm") hh += 12
    h = hh
  }

  h = clamp(h, 0, 23)
  m = clamp(m, 0, 59)
  s = clamp(s, 0, 59)
  if (!withSec) s = 0
  return { h, m, s }
}

export function SleekTimePicker({
  id = "time",
  name,
  value,
  onChange,
  format = "HH:mm",
  placeholder = "Select time",
  label,
  disabled,
  readOnly,
  required,
  className,
  defaultValue,
  autoCloseOnApply = true,
  onOpenChange,
}: SleekTimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // strictly controlled by `format`
  const use12 = is12h(format)
  const withSec = showSeconds(format)

  // initial
  const initial = React.useMemo(
    () => parseStrict(value) ?? parseStrict(defaultValue) ?? null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [parts, setParts] = React.useState<Parts | null>(initial)
  const [text, setText] = React.useState<string>(toDisplay(initial, format))

  const hourRef = React.useRef<HTMLDivElement>(null)
  const minRef = React.useRef<HTMLDivElement>(null)
  const secRef = React.useRef<HTMLDivElement>(null)

  // track which column changed last to avoid cross-animations
  const lastChangedRef = React.useRef<"h" | "m" | "s" | null>(null)

  // keep controlled in sync
  React.useEffect(() => {
    const p = parseStrict(value)
    setParts(p)
    setText(toDisplay(p, format))
  }, [value, format])

  const changeOpen = (o: boolean) => {
    setOpen(o)
    onOpenChange?.(o)
    if (o) lastChangedRef.current = null // opening: no animated jiggle
  }

  const commit = (p: Parts | null) => {
    setParts(p)
    setText(toDisplay(p, format))
    onChange?.(p ? toValue(p, withSec) : "")
  }

  const setHour24 = (h: number) => {
    lastChangedRef.current = "h"
    commit({ h: clamp(h, 0, 23), m: parts?.m ?? 0, s: parts?.s ?? 0 })
  }
  const setMinute = (m: number) => {
    lastChangedRef.current = "m"
    commit({ h: parts?.h ?? 0, m: clamp(m, 0, 59), s: parts?.s ?? 0 })
  }
  const setSecond = (s: number) => {
    lastChangedRef.current = "s"
    commit({ h: parts?.h ?? 0, m: parts?.m ?? 0, s: clamp(s, 0, 59) })
  }

  const hours = use12 ? range(12, 1) : range(24, 0)
  const minutes = range(60, 0)
  const seconds = minutes

  const isAM = parts ? parts.h < 12 : true
  const hourDisplay = !parts ? (use12 ? 12 : 0) : use12 ? (parts.h % 12 === 0 ? 12 : parts.h % 12) : parts.h

  // typing UX
  const handleType = (v: string) => {
    setText(v)
    const p = parseLoose(v, use12, withSec)
    if (p) {
      // infer which changed most: if hour differs, mark 'h'; else if minute differs, 'm'...
      const prev = parts
      if (prev && p.h !== prev.h) lastChangedRef.current = "h"
      else if (prev && p.m !== prev.m) lastChangedRef.current = "m"
      else if (prev && p.s !== prev.s) lastChangedRef.current = "s"
      commit(p)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault()
        changeOpen(true)
        break
      case "Escape":
        changeOpen(false)
        break
      case "Enter":
        e.preventDefault()
        if (autoCloseOnApply) changeOpen(false)
        break
    }
  }

  /** Radix ScrollArea viewport helper */
  const getViewport = (container: HTMLDivElement | null) =>
    (container?.querySelector<HTMLElement>('[data-radix-scroll-area-viewport]') as HTMLElement | null) ?? container

  const scrollToIdx = (container: HTMLDivElement | null, idx: number, behavior: ScrollBehavior) => {
    const viewport = getViewport(container)
    if (!viewport) return
    const el = viewport.querySelector<HTMLElement>(`[data-index="${idx}"]`)
    el?.scrollIntoView({ block: "center", behavior })
  }

  const syncScroll = React.useCallback(() => {
    if (!parts) return
    const hKey = use12 ? ((parts.h % 12) || 12) : parts.h
    const hi = hours.indexOf(hKey)
    const mi = minutes.indexOf(parts.m)
    const si = seconds.indexOf(parts.s)

    // only animate the column that changed; others re-center instantly
    const changed = lastChangedRef.current
    if (hi >= 0) scrollToIdx(hourRef.current, hi, changed === "h" ? "smooth" : "auto")
    if (mi >= 0) scrollToIdx(minRef.current, mi, changed === "m" ? "smooth" : "auto")
    if (withSec && si >= 0) scrollToIdx(secRef.current, si, changed === "s" ? "smooth" : "auto")
    lastChangedRef.current = null
  }, [parts, use12, withSec, hours, minutes, seconds])

  React.useEffect(() => {
    if (open) {
      const id = setTimeout(syncScroll, 40)
      return () => clearTimeout(id)
    }
  }, [open, syncScroll])

  React.useEffect(() => {
    if (open) syncScroll()
  }, [value, open, syncScroll])

  /** Make the whole column (including header) wheel-scroll the list */
  const wheelScroll = (ref: React.RefObject<HTMLDivElement | null>) =>
    (e: React.WheelEvent) => {
      const vp = getViewport(ref.current)
      if (!vp) return
      vp.scrollTop += e.deltaY
      e.preventDefault()
    }

  /* Simple column: normal list-like scroller, full-width wheel capture */
  const Column = ({
    title,
    options,
    value,
    onSelect,
    refEl,
  }: {
    title: string
    options: number[]
    value: number
    onSelect: (n: number) => void
    refEl: React.RefObject<HTMLDivElement | null>
  }) => (
    <div className="flex flex-col gap-2 min-w-0" onWheel={wheelScroll(refEl)}>
      <div className="text-[10px] tracking-wide font-medium text-muted-foreground px-1 select-none">
        {title}
      </div>
      <ScrollArea ref={refEl} className="h-48 w-full rounded-md border bg-card">
        <div className="py-1">
          {options.map((n, idx) => {
            const active = value === n
            return (
              <Button
                key={n}
                data-index={idx}
                size="sm"
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "h-8 w-full justify-center font-mono text-sm rounded-none",
                  "hover:bg-accent hover:text-accent-foreground"
                )}
                type="button"
                onClick={() => onSelect(n)}
                aria-pressed={active}
              >
                {pad2(n)}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={id} className="px-1 text-sm font-medium">
          {label}{required ? <span className="text-destructive"> *</span> : null}
        </Label>
      )}

      <div className="relative">
        <Input
          id={id}
          name={name}
          value={text}
          onChange={(e) => handleType(e.target.value)}
          onBlur={() => setText(toDisplay(parts, format))}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          // <<< less rounded, like your calendar input
          className={cn(
            "bg-background pr-10",
            "focus:ring-2 focus:ring-primary/20 focus:border-primary",
            open && "ring-2 ring-primary/20 border-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onKeyDown={handleKeyDown}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? `${id}-tp-popover` : undefined}
        />

        <Popover open={open} onOpenChange={changeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "absolute top-1/2 right-2 size-7 -translate-y-1/2",
                (disabled || readOnly) ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
              )}
              disabled={disabled || readOnly}
              aria-label={open ? "Close time picker" : "Open time picker"}
            >
              <Clock className="size-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent
            id={`${id}-tp-popover`}
            className="w-[280px] p-3 shadow-2xl border-border/50 rounded-xl"
            align="end"
            sideOffset={10}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="space-y-3">
              {/* Columns */}
              <div className={cn("grid gap-3", withSec ? "grid-cols-3" : "grid-cols-2")}>
                <Column
                  title={use12 ? "HOUR (12)" : "HOUR (24)"}
                  options={hours}
                  value={hourDisplay}
                  onSelect={(h) => {
                    const h24 = use12 ? ((h % 12) + (isAM ? 0 : 12)) % 24 : h
                    setHour24(h24)
                  }}
                  refEl={hourRef}
                />
                <Column
                  title="MIN"
                  options={minutes}
                  value={parts?.m ?? 0}
                  onSelect={setMinute}
                  refEl={minRef}
                />
                {withSec && (
                  <Column
                    title="SEC"
                    options={seconds}
                    value={parts?.s ?? 0}
                    onSelect={setSecond}
                    refEl={secRef}
                  />
                )}
              </div>

              {/* AM/PM toggle (only when 12h format) */}
              {use12 && (
                <div className="flex gap-2 p-2 bg-muted/40 rounded-md border justify-center">
                  <Button
                    size="sm"
                    variant={isAM ? "default" : "outline"}
                    className="flex-1"
                    type="button"
                    onClick={() => {
                      const p = parts ?? { h: 0, m: 0, s: 0 }
                      if (p.h >= 12) setHour24(p.h - 12)
                    }}
                  >
                    AM
                  </Button>
                  <Button
                    size="sm"
                    variant={!isAM ? "default" : "outline"}
                    className="flex-1"
                    type="button"
                    onClick={() => {
                      const p = parts ?? { h: 0, m: 0, s: 0 }
                      if (p.h < 12) setHour24(p.h + 12)
                    }}
                  >
                    PM
                  </Button>
                </div>
              )}

              {/* actions */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => commit(null)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="size-3 mr-1" />
                  Clear
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => {
                      const now = new Date()
                      commit({
                        h: now.getHours(),
                        m: now.getMinutes(),
                        s: withSec ? now.getSeconds() : 0,
                      })
                    }}
                  >
                    Now
                  </Button>
                  {/* <Button variant="outline" size="sm" type="button" onClick={() => setOpen(false)}>
                    Cancel
                  </Button> */}
                  <Button
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (autoCloseOnApply) setOpen(false)
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
