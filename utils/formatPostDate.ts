import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatPostDate(dateString: string) {
  const date = dayjs(dateString);

  if (dayjs().diff(date, "day") < 7) {
    return date.fromNow();
  }

  return date.format("MMM D, YYYY");
}