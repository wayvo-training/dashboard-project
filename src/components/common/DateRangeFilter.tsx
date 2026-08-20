import {Button} from "../ui/button";


export type DateRange =
  | "7days"
  | "1month"
  | "3months"
  | "custom";

type DateRangeFilterProps = {
  value: DateRange;
  onChange: (value: DateRange) => void;

  startDate: string;
  endDate: string;

  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;

  minDate: string;
  maxDate: string;
};

const options: {
  value: DateRange;
  label: string;
}[] = [
  {
    value: "7days",
    label: "Last 7 Days",
  },
  {
    value: "1month",
    label: "Last 1 Month",
  },
  {
    value: "3months",
    label: "Last 3 Months",
  },
  {
    value: "custom",
    label: "Custom",
  },
];

function DateRangeFilter({
  value,
  onChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate,
  maxDate,
}: DateRangeFilterProps) {
  return (
    <div className="mb-6">

      {/* Date range buttons */}
      <div className="flex flex-wrap gap-3">

        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={
              value === option.value
                ? "default"
                : "outline"
            }
            onClick={() =>
              onChange(option.value)
            }
          >
            {option.label}
          </Button>
        ))}

      </div>

      {/* Custom date selection */}
      {value === "custom" && (
        <div className="mt-4 flex flex-wrap gap-4">

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              min={minDate}
              max={maxDate}
              onChange={(event) =>
                onStartDateChange(
                  event.target.value
                )
              }
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              min={minDate}
              max={maxDate}
              onChange={(event) =>
                onEndDateChange(
                  event.target.value
                )
              }
              className="rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

        </div>
      )}

    </div>
  );
}

export default DateRangeFilter;