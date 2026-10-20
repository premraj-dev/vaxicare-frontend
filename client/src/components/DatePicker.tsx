import * as React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (date: string) => void;
  placeholder?: string;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD, defaults to today for DOB if isDob=true
  isDob?: boolean; // If true, adds quick child age presets (Newborn, 6m, 1y, 2y, etc.)
  className?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${padZero(month + 1)}-${padZero(day)}`;
}

function parseDateString(str?: string): { year: number; month: number; day: number } | null {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  return { year: y, month: m, day: d };
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  const parsed = parseDateString(dateStr);
  if (!parsed) return dateStr;
  const monthName = MONTHS[parsed.month]?.slice(0, 3) || "";
  return `${padZero(parsed.day)} ${monthName} ${parsed.year}`;
}

export function DatePicker({
  value = "",
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  isDob = false,
  className,
  id,
  disabled = false,
  required = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  // Today reference
  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const todayStr = formatDateString(todayYear, todayMonth, todayDay);

  const effectiveMaxDate = maxDate ?? (isDob ? todayStr : undefined);

  // Parse current value
  const parsedValue = useMemo(() => parseDateString(value), [value]);

  // Current view state (Month & Year shown in calendar)
  const [viewYear, setViewYear] = useState<number>(() => {
    return parsedValue ? parsedValue.year : todayYear;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    return parsedValue ? parsedValue.month : todayMonth;
  });

  // When opening, reset view to selected date or today
  useEffect(() => {
    if (open) {
      if (parsedValue) {
        setViewYear(parsedValue.year);
        setViewMonth(parsedValue.month);
      } else {
        setViewYear(todayYear);
        setViewMonth(todayMonth);
      }
    }
  }, [open, parsedValue, todayYear, todayMonth]);

  // Generate Year Range
  const startYear = isDob ? 2015 : 1970;
  const endYear = isDob ? todayYear : todayYear + 10;
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = endYear; y >= startYear; y--) {
      list.push(y);
    }
    return list;
  }, [startYear, endYear]);

  // Calendar calculations
  // Get days in current view month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Day of week of first day (0 = Sunday, 1 = Monday, ...) -> convert to Monday=0
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  // Previous and next month handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Day selection
  const handleSelectDay = (day: number) => {
    const selected = formatDateString(viewYear, viewMonth, day);
    onChange?.(selected);
    setOpen(false);
  };

  // Age preset helper for child DOB
  const applyAgePreset = (monthsAgo: number) => {
    const target = new Date();
    target.setMonth(target.getMonth() - monthsAgo);
    const dateStr = formatDateString(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );
    onChange?.(dateStr);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "group relative flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-left text-sm text-slate-800 outline-none transition-all duration-200",
            "hover:border-emerald-500/50 hover:bg-white",
            "focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10",
            open && "border-emerald-600 bg-white ring-4 ring-emerald-500/10 shadow-xs",
            disabled && "cursor-not-allowed opacity-50 bg-slate-100",
            className
          )}
        >
          <span className={cn("truncate font-medium", !value && "text-slate-400 font-normal")}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover:text-emerald-700 transition-colors">
            {value && !disabled && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange?.("");
                }}
                className="grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                title="Clear date"
              >
                <X className="h-3 w-3" />
              </span>
            )}
            <CalendarIcon className="h-4 w-4 text-emerald-700 transition-transform group-hover:scale-105" />
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="z-50 w-[330px] rounded-2xl border border-emerald-100/80 bg-white p-4 shadow-[0_20px_50px_-15px_rgba(6,78,59,0.18)] outline-none animate-in fade-in-0 zoom-in-95 duration-150"
      >
        {/* Child Age Quick Select Chips (Only for Child DOB) */}
        {isDob && (
          <div className="mb-3.5 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                Quick Age Preset
              </span>
              <span className="text-[10px] text-slate-400">Child's age</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "Newborn", months: 0 },
                { label: "6 Mo", months: 6 },
                { label: "1 Year", months: 12 },
                { label: "2 Years", months: 24 },
                { label: "3 Years", months: 36 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyAgePreset(preset.months)}
                  className="rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-600 hover:text-white hover:border-emerald-600 active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Month & Year Selection Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            {/* Month Select */}
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-800 outline-none hover:bg-slate-100 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-800 outline-none hover:bg-slate-100 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 cursor-pointer"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Steppers */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {WEEKDAYS.map((day) => (
            <span
              key={day}
              className="h-6 flex items-center justify-center text-[11px] font-bold text-slate-400 select-none"
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8 w-8" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayDateStr = formatDateString(viewYear, viewMonth, dayNum);

            const isSelected = value === dayDateStr;
            const isToday = todayStr === dayDateStr;

            // Check min/max date
            const isBeforeMin = minDate ? dayDateStr < minDate : false;
            const isAfterMax = effectiveMaxDate ? dayDateStr > effectiveMaxDate : false;
            const isDisabled = isBeforeMin || isAfterMax;

            return (
              <button
                key={dayNum}
                type="button"
                disabled={isDisabled}
                onClick={() => handleSelectDay(dayNum)}
                className={cn(
                  "relative grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold transition-all duration-150 select-none",
                  isSelected
                    ? "bg-[#064E3B] text-white shadow-md shadow-emerald-900/20 font-bold scale-105"
                    : isDisabled
                    ? "text-slate-300 cursor-not-allowed opacity-40"
                    : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 active:scale-95",
                  isToday && !isSelected && "border border-emerald-500 font-extrabold text-emerald-800 bg-emerald-50/40"
                )}
              >
                {dayNum}
                {isToday && !isSelected && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-emerald-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer with Today / Clear button */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onChange?.(todayStr);
              setViewYear(todayYear);
              setViewMonth(todayMonth);
              setOpen(false);
            }}
            disabled={effectiveMaxDate ? todayStr > effectiveMaxDate : false}
            className="font-bold text-emerald-700 hover:text-emerald-900 transition hover:underline disabled:opacity-40 disabled:hover:no-underline"
          >
            Today ({padZero(todayDay)} {MONTHS[todayMonth].slice(0, 3)})
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange?.("");
                setOpen(false);
              }}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              Clear
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
