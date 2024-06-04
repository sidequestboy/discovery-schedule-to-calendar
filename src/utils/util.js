function createTime(hours, minutes) {
  const time = new Date();
  // Reset the date to a fixed date (e.g., 1970-01-01) to ignore the date part
  time.setFullYear(1970, 0, 1);

  time.setHours(hours);
  time.setMinutes(minutes || 0);
  time.setSeconds(0);
  time.setMilliseconds(0);

  return time;
}

// assumes startTimeString and endTimeString are 12h clock
// formatted and date is of the form "2023-03-01"
function toDateAndTime(dateString, startTimeString, endTimeString) {
  const dayTimeHours = [createTime(6, 0), createTime(18, 0)];
  const timeRegex = /^.*?(?<hour>[0-9]{1,2}):(?<minute>[0-9]{2}).*$/;
  const startTimeMatch = startTimeString.match(timeRegex);
  const endTimeMatch = endTimeString.match(timeRegex);
  if (startTimeMatch === null || endTimeMatch === null) {
    return null;
  }
  const dateRegex = /^(?<year>[0-9]+)-(?<month>[0-9]+)-(?<date>[0-9]+)$/;
  const dateMatch = dateString.match(dateRegex);
  if (dateMatch === null) {
    return null;
  }
  const year = Number(dateMatch.groups.year);
  const month = Number(dateMatch.groups.month) - 1;
  const date = Number(dateMatch.groups.date);

  const shift = to24h([
    createTime(startTimeMatch.groups.hour, startTimeMatch.groups.minute),
    createTime(endTimeMatch.groups.hour, endTimeMatch.groups.minute),
  ]);
  return shift.map((t) => {
    return new Date(year, month, date, t.getHours(), t.getMinutes());
  });

  function to24h(shift) {
    if (shift.length < 2) return null;
    if (shift[0].getHours() > 12 || shift[1].getHours() > 12) {
      // already 24h presumably
      return shift;
    }

    if (shift[0].getHours() === 12) {
      shift[0].setHours(0);
    } else if (shift[1].getHours() === 12) {
      shift[1].setHours(0);
    }

    if (shift[0].getTime() < shift[1].getTime()) {
      // am, am or pm, pm
      const pmpmShift = shift.map((t) =>
        createTime(t.getHours() + 12, t.getMinutes()),
      );
      const amamIntersection = intersection(shift, dayTimeHours);
      const pmpmIntersection = intersection(pmpmShift, dayTimeHours);

      if (amamIntersection === null) {
        return pmpmShift;
      } else if (pmpmIntersection === null) {
        return shift;
      } else if (
        amamIntersection[1].getTime() - amamIntersection[0].getTime() >
        pmpmIntersection[1].getTime() - pmpmIntersection[0].getTime()
      ) {
        return shift;
      } else {
        return pmpmShift;
      }
    } else {
      // am, pm or pm, am
      const amPmShift = [
        shift[0],
        createTime(shift[1].getHours() + 12, shift[1].getMinutes()),
      ];
      const pmAmShift = [
        createTime(shift[0].getHours() + 12, shift[0].getMinutes()),
        shift[1],
      ];
      const amPmIntersection = intersection(amPmShift, dayTimeHours);
      const pmAmIntersection = intersection(pmAmShift, dayTimeHours);

      if (amPmIntersection === null) {
        return pmAmShift;
      } else if (pmAmIntersection === null) {
        return amPmShift;
      } else if (
        amPmIntersection[1].getTime() - amPmIntersection[0].getTime() >
        pmAmIntersection[1].getTime() - pmAmIntersection[1].getTime()
      ) {
        return amPmShift;
      } else {
        return pmAmShift;
      }
    }
  }
}

function intersection(intervalOne, intervalTwo) {
  // assume 24h clock, times are Date objects all with the same date.
  const intervalOneCrossesMidnight =
    intervalOne[0].getTime() > intervalOne[1].getTime();
  const intervalTwoCrossesMidnight =
    intervalTwo[0].getTime() > intervalTwo[1].getTime();
  const adjustedIntervalOne = [
    intervalOneCrossesMidnight
      ? createTime(intervalOne[0].getHours() - 24, intervalOne[0].getMinutes())
      : intervalOne[0],
    intervalOne[1],
  ];
  const adjustedIntervalTwo = [
    intervalTwoCrossesMidnight
      ? createTime(intervalTwo[0].getHours() - 24, intervalTwo[0].getMinutes())
      : intervalTwo[0],
    intervalTwo[1],
  ];

  let intersectionStart, intersectionEnd;

  intersectionStart = new Date(
    Math.max(
      adjustedIntervalOne[0].getTime(),
      adjustedIntervalTwo[0].getTime(),
    ),
  );
  intersectionEnd = new Date(
    Math.min(
      adjustedIntervalOne[1].getTime(),
      adjustedIntervalTwo[1].getTime(),
    ),
  );

  if (intersectionStart.getTime() > intersectionEnd.getTime()) {
    return null;
  }

  if (intersectionStart.getDate() !== 1) {
    intersectionStart = createTime(
      intersectionStart.getHours(),
      intersectionStart.getMinutes(),
    );
  }
  if (intersectionEnd.getDate() !== 1) {
    intersectionEnd = createTime(
      intersectionEnd.getHours(),
      intersectionEnd.getMinutes(),
    );
  }

  return [intersectionStart, intersectionEnd];
}

// for a week containing a 1st of the month, we need to determine whether the 1st is
// "this" month or "next" month.
// if the 1st falls on a Monday, we know it is "this" month since the week isn't split.
// else if end date of previous month is 28, then the month is March.
// else if the day of the 1st matches the day of "this" month, it is "this" month.
// otherwise, it is "next" month.
// day = 0 is Sunday, day = 1 is Monday ... the day of the 1st
// endDate is the number of the previous month's end date.
// year, month are Numbers. month is zero-indexed.
function firstIsThisMonth(day, endDate, year, month) {
  if (day === 1) {
    return true;
  } else if (endDate === 28) {
    return month === 2; // March
  } else if (new Date(year, month).getUTCDay() === day) {
    return true;
  } else {
    return false;
  }
}

export class ValidationError extends Error {
  constructor(message, { name, store, month }) {
    super(message);
    this.name = name;
    this.store = store;
    this.month = month;
  }
}

function parseSheetsData(sheetsData, inputName, inputMonth) {
  let shifts = [];
  const inputMonthRegex = /^(?<year>[0-9]+)-(?<month>[0-9]{2})$/;
  const inputMonthMatch = inputMonth.match(inputMonthRegex);
  const year = Number(inputMonthMatch.groups.year);
  const month = Number(inputMonthMatch.groups.month) - 1; // 0 indexed

  function createMonthDate(month) {
    const monthDate = new Date();
    monthDate.setFullYear(year);
    monthDate.setHours(0);
    monthDate.setMinutes(0);
    monthDate.setSeconds(0);
    monthDate.setMilliseconds(0);
    monthDate.setMonth(month);
    return monthDate;
  }
  const monthDate = createMonthDate(month);
  const lastMonthDate = createMonthDate(month - 1);
  const nextMonthDate = createMonthDate(month + 1);
  const schedule = sheetsData.map((sheetData) => {
    // const dayRow = sheetData.result.values[5];
    const dayRowIndex =
      sheetData.result.values.findIndex((row) => {
        return row.length > 1 && row[1].toLowerCase().trim() === "monday";
      }) || null;
    console.log(dayRowIndex);
    const dayRow = sheetData.result.values[dayRowIndex];
    const dateRow = sheetData.result.values[dayRowIndex + 1];
    const namedRow =
      sheetData.result.values
        .filter((row) => {
          return (
            row.length > 0 &&
            row[0].toLowerCase().trim() === inputName.toLowerCase().trim()
          );
        })
        .at(0) || null;
    return {
      dayRow: dayRow,
      dateRow: dateRow,
      namedRow: namedRow,
    };
  });
  if (schedule.every((val) => val.namedRow === null)) {
    throw new ValidationError(`Name "${inputName}" is not on the schedule`, {
      name: `Name "${inputName}" is not on the schedule`,
      store: null,
      month: null,
    });
  }

  schedule.forEach((week) => {
    const firstIndex = week.dateRow.indexOf("1");
    let thisMonth = true;
    if (firstIndex !== -1 && firstIndex !== 0) {
      const days = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };
      const day = Number(days[week.dayRow[firstIndex].trim().toLowerCase()]);
      const endDate = Number(week.dateRow[firstIndex - 2]);
      thisMonth = firstIsThisMonth(day, endDate, year, month);
    }

    const evenIndex = (_, i) => i % 2 === 0;
    const dates = week.dateRow.slice(1).filter(evenIndex).slice(0, 7);
    const startTimes = week.namedRow.slice(1).filter(evenIndex).slice(0, 7);
    const endTimes = week.namedRow
      .slice(1)
      .filter((_, i) => !evenIndex(_, i))
      .slice(0, 7);

    dates.forEach((date, i) => {
      let adjustedMonthDate;
      if (firstIndex === -1) {
        // middle week, normal sitch
        adjustedMonthDate = monthDate;
      } else if (thisMonth) {
        // end of last month, start of this month
        if (Number(date) > 7) {
          adjustedMonthDate = lastMonthDate;
        } else {
          adjustedMonthDate = monthDate;
        }
      } else {
        // end of this month, start of next month
        if (Number(date) <= 7) {
          adjustedMonthDate = nextMonthDate;
        } else {
          adjustedMonthDate = monthDate;
        }
      }
      if (startTimes[i] && endTimes[i]) {
        const shift = toDateAndTime(
          `${adjustedMonthDate.getFullYear()}-${
            adjustedMonthDate.getMonth() + 1 < 10 ? 0 : ""
          }${adjustedMonthDate.getMonth() + 1}-${
            Number(date) < 10 ? 0 : ""
          }${date}`,
          startTimes[i],
          endTimes[i],
        );
        if (shift !== null && shift.length === 2) {
          shifts.push(shift);
        }
      }
    });
  });

  return shifts;
}

export const isDev = () =>
  !process.env.NODE_ENV || process.env.NODE_ENV === "development";

export {
  parseSheetsData,
  createTime,
  toDateAndTime,
  intersection,
  firstIsThisMonth,
};
