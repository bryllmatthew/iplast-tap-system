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

const philippineTimeZone = "Asia/Manila";

export function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: philippineTimeZone
  }).format(new Date(value));
}

export function eventTimeRange(startTime: string, endTime: string) {
  return `${formatClockTime(startTime)} - ${formatClockTime(endTime)}`;
}

function formatClockTime(value: string) {
  const [hourValue, minuteValue = "0"] = value.split(":");
  return `${String(Number(hourValue)).padStart(2, "0")}:${String(Number(minuteValue)).padStart(2, "0")}`;
}

export function time(value: string) {
  const formattedTime = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: philippineTimeZone
  }).format(new Date(value));

  return `${formattedTime} PHT`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
