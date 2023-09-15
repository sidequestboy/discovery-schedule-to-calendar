import { IonIcon } from "@ionic/react";
import { checkmarkCircle } from "ionicons/icons";

import { getCalendarLink } from "../utils/calendar";

export function CalendarEventList({ shifts }) {
  return (
    <ol className="calendar-event-list">
      {shifts.map((shift) => (
        <CalendarEvent
          start={shift.startTime}
          end={shift.endTime}
          key={shift.startTime.toUTCString() + shift.endTime.toUTCString()}
          checked={shift.eventAdded}
        />
      ))}
    </ol>
  );
}

function CalendarEvent({ start, end, checked }) {
  const timeOptions = {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  };
  const dateOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  // prettier-ignore
  const timeEmojis = [
    "🕛", "🕧", "🕐", "🕜", "🕑", "🕝", "🕒", "🕞", "🕓", "🕟", "🕔", "🕠",
    "🕕", "🕡", "🕖", "🕢", "🕗", "🕣", "🕘", "🕤", "🕙", "🕥", "🕚", "🕦",
  ];
  const getEmojiIndex = (time) =>
    (time.getHours() >= 12 ? (time.getHours() - 12) * 2 : time.getHours() * 2) +
    (time.getMinutes() > 0 ? 1 : 0);
  const startTimeEmoji = timeEmojis.at(getEmojiIndex(start));
  const endTimeEmoji = timeEmojis.at(getEmojiIndex(end));

  const dateString = start.toLocaleDateString("en-US", dateOptions);
  const [day, date] = dateString.split(", ");
  const dayClass = start
    .toLocaleDateString("en-US", { weekday: "short" })
    .toLowerCase();
  return (
    <>
      <li className={`${dayClass} ${checked ? "done" : ""}`}>
        <div className="calendar-event-container">
          <p>{day}</p>
          <a href={getCalendarLink(start)} target="_blank" rel="noreferrer">
            🗓️ {date}
          </a>
          <p>
            {`${startTimeEmoji} ${start
              .toLocaleTimeString("en-US", timeOptions)
              .split(" ")
              .at(0)} `}
            &rarr;
            {` ${end
              .toLocaleTimeString("en-US", timeOptions)
              .split(" ")
              .at(0)} ${endTimeEmoji}`}
          </p>
        </div>
        <IonIcon icon={checkmarkCircle} />
      </li>
    </>
  );
}
