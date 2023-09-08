import { gapi } from "./google";

export function createEvent(shift, store, calendarId) {
  const locations = {
    blanshard: "1001 Blanshard Street",
    "oak bay": "1964 Oak Bay Ave",
    "james bay": "281 Menzies St",
    downtown: "664 Discovery St",
  };
  const createEventRequest = gapi.client.calendar.events.insert({
    calendarId: calendarId,
    summary: "shift",
    location: locations[store],
    start: {
      dateTime: shift.startTime.toISOString(),
      timeZone: "America/Vancouver",
    },
    end: {
      dateTime: shift.endTime.toISOString(),
      timeZone: "America/Vancouver",
    },
  });

  return new Promise((resolve, reject) => {
    createEventRequest.execute((e) => {
      if (e.status === "confirmed") {
        console.log(e);
        console.log("Event created " + e.htmlLink);
        resolve(e);
      } else {
        reject(e);
      }
    });
  });
}

export function getCalendarLink(calendarDate) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth() + 1;
  const date = calendarDate.getDate();
  return `https://calendar.google.com/calendar/u/0/r/week/${year}/${month}/${date}`;
}
