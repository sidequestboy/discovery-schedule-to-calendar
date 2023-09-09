import { useRef, useState } from "react";

import { gapi, calendarScope } from "../utils/google";
import { authParams } from "../utils/auth";
import { createEvent, getCalendarLink } from "../utils/calendar";

import { PromptBox } from "./PromptBox";

export function AddCalendarPrompt({
  tokenClient,
  token,
  shifts,
  setShifts,
  store,
}) {
  const calendarId = useRef(null);

  const [authorized, setAuthorized] = useState(false);
  const [existingOrNew, setExistingOrNew] = useState("new");
  const [existingCalendars, setExistingCalendars] = useState([]);
  const [newCalendarName, setNewCalendarName] = useState("Discovery Coffee");
  const [existingCalendarId, setExistingCalendarId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [finished, setFinished] = useState(false);

  // initialize calendar api
  const authorize = () => {
    tokenClient.current.callback = async (res) => {
      if (res.error !== undefined) {
        throw res;
      }
      if (res.access_token !== undefined) {
        setAuthorized(true);
        setIsLoading(true);
        token.current = res.access_token;
        gapi.client.setApiKey(authParams.api_key);
        gapi.client.setToken({ access_token: res.access_token });
        await gapi.client.load(
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"
        );
        const request = gapi.client.calendar.calendarList.list();
        request.execute();
        const response = await request;
        const calendars = response.result.items;
        setExistingCalendars(calendars);
        setIsLoading(false);
      }
    };
    tokenClient.current.requestAccessToken({
      scope: calendarScope,
    });
  };

  const addCalendarEvents = async () => {
    setIsLoading(true);
    if (existingOrNew === "new") {
      try {
        const createNewCalendarResponse =
          await gapi.client.calendar.calendars.insert({
            summary: newCalendarName,
          });
        calendarId.current = createNewCalendarResponse.result.id;
        await gapi.client.calendar.calendars.update({
          summary: newCalendarName,
          calendarId: calendarId.current,
          timeZone: "America/Vancouver",
          description: "Schedule at Discovery Coffee",
        });
      } catch (e) {
        setError(`Couldn't create new calendar ${newCalendarName}`);
      }
    } else {
      calendarId.current = existingCalendarId;
    }

    const maxTries = 20;
    for (let i = 0; i < shifts.length; i++) {
      let count = 0;
      while (count < maxTries) {
        try {
          await createEvent(shifts[i], store, calendarId.current);
          setShifts((shifts) =>
            shifts.map((shift, index) =>
              index === i ? { ...shift, eventAdded: true } : shift
            )
          );
          console.log("Success");
          break;
        } catch (e) {
          console.error("Error creating event", e);
          await new Promise((resolve) => setTimeout(resolve, 100));
          count++;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (count === maxTries) {
        setError("Exceeded max tries of creating calendar event - aborting.");
        break;
      }
    }

    setIsLoading(false);
    setFinished(true);
  };

  return (
    <PromptBox error={error} isLoading={isLoading}>
      {!authorized && (
        <>
          <h3 className="heading-tertiary">
            To add to your calendar, authorize access:
          </h3>
          <button className="btn" onClick={authorize}>
            Authorize
          </button>
        </>
      )}
      {!finished && authorized && (
        <form className="add-to-calendar-form">
          <h3 className="heading-tertiary">
            Add to an existing calendar or create new?
          </h3>
          <label htmlFor="existing-or-new">Existing or new calendar:</label>
          <select
            id="existing-or-new"
            value={existingOrNew}
            onChange={async (e) => {
              setExistingOrNew(e.target.value);
            }}
          >
            <option value="new">Create new calendar</option>
            <option value="existing">Add to existing calendar</option>
          </select>
          {existingOrNew === "existing" && (
            <>
              <label htmlFor="existing-calendars">
                Choose calendar to modify:
              </label>
              <select
                id="existing-calendars"
                onChange={(e) => setExistingCalendarId(e.target.value)}
              >
                {existingCalendars
                  .filter(
                    (cal) =>
                      cal.accessRole === "writer" || cal.accessRole === "owner"
                  )
                  .sort((a) => a.primary)
                  .map((cal) => (
                    <option
                      style={{ backgroundColor: cal.backgroundColor }}
                      value={cal.id}
                      key={cal.id}
                    >
                      {cal.summary}
                    </option>
                  ))}
              </select>
            </>
          )}
          {existingOrNew === "new" && (
            <>
              <label htmlFor="new-calendar-name">New calendar name:</label>
              <input
                type="text"
                value={newCalendarName}
                onChange={(e) => setNewCalendarName(e.target.value)}
              />
            </>
          )}
          <button
            className="btn"
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              addCalendarEvents();
            }}
          >
            Add to calendar
          </button>
        </form>
      )}
      {finished && (
        <>
          <p>Finished!</p>
          <p>
            <a href={getCalendarLink(shifts.at(0).startTime)} target="_blank">
              Calendar
            </a>
          </p>
          <button className="btn" onClick={() => location.reload()}>
            Start over?
          </button>
        </>
      )}
    </PromptBox>
  );
}
