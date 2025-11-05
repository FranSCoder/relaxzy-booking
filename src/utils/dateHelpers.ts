import { DateTime } from "luxon";
import { Formats } from "react-big-calendar";

export const calendarFormats: Formats = {
  eventTimeRangeFormat: ({ start, end }, culture, localizer) => {
    const startStr = DateTime.fromJSDate(start).toFormat("HH:mm");
    const diffMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    return `${startStr} - ${diffMinutes}min`;
  },
};
