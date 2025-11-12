// components/ui/calendar-with-input.tsx
"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function toISO(date: Date | undefined) {
  if (!date || isNaN(date.getTime())) return ""
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function fromISO(iso: string | undefined): Date | undefined {
  if (!iso) return undefined
  const parts = iso.split("-")
  if (parts.length !== 3) return undefined
  const [y, m, d] = parts.map(Number)
  const dt = new Date(y, (m || 1) - 1, d || 1)
  if (isNaN(dt.getTime())) return undefined
  if (dt.getFullYear() !== y || dt.getMonth() !== (m - 1) || dt.getDate() !== d) return undefined
  return dt
}

function formatPretty(date: Date | undefined) {
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

type Props = {
  id?: string
  /** Controlled value as YYYY-MM-DD (like a native date input) */
  value?: string
  onChange?: (value: string) => void
  placeholder?: string

  // 👇 New optional native-style props
  required?: boolean
  min?: string
  max?: string
  name?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
}

export function CalendarWithInput({
  id = "date",
  value,
  onChange,
  placeholder = "Select a date",
  required,
  min,
  max,
  name,
  disabled,
  readOnly,
  className,
}: Props) {
  const controlledDate = fromISO(value)
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(controlledDate)
  const [month, setMonth] = React.useState<Date>(controlledDate ?? new Date())
  const [text, setText] = React.useState<string>(formatPretty(controlledDate))

  React.useEffect(() => {
    const d = fromISO(value)
    setDate(d)
    if (d) setMonth(d)
    setText(formatPretty(d))
  }, [value])

  // validation helper
  const isWithinRange = (d: Date) => {
    const minDate = fromISO(min)
    const maxDate = fromISO(max)
    if (minDate && d < minDate) return false
    if (maxDate && d > maxDate) return false
    return true
  }

  return (
    <div className="relative flex gap-2">
      <Input
        id={id}
        name={name}
        value={text}
        placeholder={placeholder}
        className={`bg-background pr-10 ${className || ""}`}
        onChange={(e) => {
          const raw = e.target.value
          setText(raw)
          const tentative = new Date(raw)
          if (!isNaN(tentative.getTime()) && isWithinRange(tentative)) {
            setDate(tentative)
            setMonth(tentative)
            onChange?.(toISO(tentative))
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault()
            setOpen(true)
          }
        }}
        onBlur={() => {
          if (date) setText(formatPretty(date))
        }}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={`${id}-picker`}
            variant="ghost"
            disabled={disabled || readOnly}
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0"
          align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(d) => {
              if (!d) return
              if (!isWithinRange(d)) return
              setDate(d)
              setText(formatPretty(d))
              onChange?.(toISO(d))
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
