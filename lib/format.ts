export function currency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0
  }).format(value);
}

export function number(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value)
  );
}

export function eventTimeRange(startTime: string, endTime: string) {
  return `${formatClockTime(startTime)} - ${formatClockTime(endTime)}`;
}

function formatClockTime(value: string) {
  const [hourValue, minuteValue = "0"] = value.split(":");
  const date = new Date();
  date.setHours(Number(hourValue), Number(minuteValue), 0, 0);

  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(date);
}

export function time(value: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
