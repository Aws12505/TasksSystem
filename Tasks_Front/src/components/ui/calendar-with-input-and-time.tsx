// components/ui/calendar-with-input-and-time.tsx
"use client"

import { CalendarWithInput } from "@/components/ui/calendar-with-input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { SleekTimePicker as TimePicker} from "@/components/ui/time-picker"

type Props = {
  /* Date (same as your CalendarWithInput) */
  id?: string
  name?: string
  value?: string                 // YYYY-MM-DD
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  min?: string
  max?: string
  disabled?: boolean
  readOnly?: boolean
  className?: string
  dateLabel?: string

  /* Time (from TimePicker) */
  timeId?: string
  timeName?: string
  timeValue?: string             // "HH:mm" or "HH:mm:ss" (24h string)
  onTimeChange?: (value: string) => void
  timeRequired?: boolean
  timeDisabled?: boolean
  timeReadOnly?: boolean
  timeClassName?: string
  timeLabel?: string
  timeFormat?: "HH:mm" | "HH:mm:ss" | "hh:mm aa" | "hh:mm:ss aa"
  minuteStep?: number
  secondStep?: number

  wrapperClassName?: string
}

export function CalendarWithInputAndTime({
  /* date */
  id = "date",
  name,
  value,
  onChange,
  placeholder = "Select a date",
  required,
  min,
  max,
  disabled,
  readOnly,
  className,
  dateLabel = "Date",
  /* time */
  timeId,
  timeName,
  timeValue,
  onTimeChange,
  timeRequired,
  timeDisabled,
  timeReadOnly,
  timeClassName,
  timeLabel = "Time",
  timeFormat = "hh:mm aa",
  /* layout */
  wrapperClassName,
}: Props) {
  return (
    <div className={cn("flex gap-4", wrapperClassName)}>
      {/* Date */}
      <div className="flex flex-col gap-2 min-w-[220px]">
        {dateLabel ? <Label htmlFor={id} className="px-1">{dateLabel}</Label> : null}
        <CalendarWithInput
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          disabled={disabled}
          readOnly={readOnly}
          className={className}
        />
      </div>

      {/* Time */}
      <div className="flex flex-col gap-2 min-w-[220px]">
        {timeLabel ? <Label htmlFor={timeId} className="px-1">{timeLabel}</Label> : null}
        <TimePicker
          id={timeId ?? `${id}-time`}
          name={timeName}
          value={timeValue}
          onChange={onTimeChange}
          disabled={timeDisabled ?? disabled}
          readOnly={timeReadOnly ?? readOnly}
          required={timeRequired}
          className={timeClassName}
          format={timeFormat}
          placeholder={timeFormat.includes("hh") ? "e.g., 09:30 AM" : "e.g., 21:30"}
        />
      </div>
    </div>
  )
}
