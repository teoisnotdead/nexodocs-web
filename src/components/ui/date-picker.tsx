"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "dd-mm-yyyy",
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateValue(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 w-full justify-start gap-2 rounded-md border-white/12 bg-white/[0.07] px-3 text-left text-sm font-normal text-white hover:bg-white/[0.1] focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/20",
              !selectedDate && "text-white/80",
              className,
            )}
          />
        }
      >
        <CalendarDays className="size-4 text-cyan-100" />
        {selectedDate ? formatDateLabel(selectedDate) : placeholder}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto rounded-md border border-white/12 bg-[#111827] p-0 text-white shadow-xl ring-1 ring-white/10"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          defaultMonth={selectedDate}
          captionLayout="dropdown"
          locale={es}
          onSelect={(nextDate) => {
            onChange(nextDate ? formatDateValue(nextDate) : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function parseDateValue(value?: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(date)
    .replace(/\//g, "-");
}
