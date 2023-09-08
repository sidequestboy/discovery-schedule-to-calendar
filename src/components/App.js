import { useRef, useState } from "react";

import { parseSheetsData } from "../utils/util";
import { getSheets, useGoogle } from "../utils/google";
import { authParams } from "../utils/auth";

import { PickerPrompt } from "./PickerPrompt";
import { ScheduleInfoPrompt } from "./ScheduleInfoPrompt";
import { AddCalendarPrompt } from "./AddCalendarPrompt";
import { CalendarEventList } from "./CalendarEventList";

import { BallTriangle } from "react-loader-spinner";

export default function App() {
  // Refs
  const token = useRef(null);
  const doc = useRef(null);

  // State
  const [stage, setStage] = useState(0);
  const [shifts, setShifts] = useState([]);
  const [pickerError, setPickerError] = useState(null);
  const [scheduleInfoFormInput, setScheduleInfoFormInput] = useState({
    name: "",
    store: "blanshard",
    month: "",
  });

  const { tokenClient, gsiLoaded, gapiLoaded } = useGoogle(authParams);

  // Helper functions
  const incrementStage = () => setStage((stage) => (stage + 1) % 3);

  // Derived State
  const errors = [
    {
      error: pickerError,
      message: "Error in the file picker",
      key: 1,
    },
  ];

  // Event handlers
  const handlePickerSelect = (retrievedDoc) => {
    doc.current = retrievedDoc;
    incrementStage();
  };
  const handleScheduleInfoFormSubmit = async (formInput) => {
    setScheduleInfoFormInput(formInput);
    const sheets = await getSheets(doc.current.id);
    const parsedSheets = parseSheetsData(
      sheets,
      formInput.name,
      formInput.month
    );
    setShifts(
      parsedSheets.map((shift) => ({
        startTime: shift[0],
        endTime: shift[1],
        eventAdded: false,
      }))
    );
    incrementStage();
  };

  return (
    <>
      <Header />
      <ErrorDisplay errors={errors} />
      {stage === 0 && (
        <PickerPrompt
          disabled={!gsiLoaded || !gapiLoaded}
          tokenClient={tokenClient}
          token={token}
          setError={setPickerError}
          onPickerSelect={handlePickerSelect}
        />
      )}
      {stage === 1 && (
        <ScheduleInfoPrompt
          doc={doc}
          onFormSubmit={handleScheduleInfoFormSubmit}
        />
      )}
      {stage === 2 && (
        <>
          <AddCalendarPrompt
            tokenClient={tokenClient}
            token={token}
            shifts={shifts}
            setShifts={setShifts}
            store={scheduleInfoFormInput.store}
          />
          <CalendarEventList shifts={shifts}></CalendarEventList>
        </>
      )}
      {stage >= 1 && <SheetPreview doc={doc} />}
    </>
  );
}

function Header() {
  return (
    <header>
      <h1 className="heading-primary">
        Discovery Coffee Spreadsheet Schedule to Calendar
      </h1>
      <h2 className="heading-secondary">by Jamie</h2>
    </header>
  );
}

function ErrorDisplay({ errors }) {
  // errors are { message: "bla bla", error: "Error" }
  return errors.map((error) => <Error error={error} key={error.key} />);
}

function Error({ error }) {
  return (
    error.error && (
      <p>
        {error.message}: {error.error}
      </p>
    )
  );
}

function SheetPreview({ doc }) {
  const [isLoading, setIsLoading] = useState(true);
  if (doc.current === null) return <></>;
  return (
    <div className="sheet-preview-container">
      <iframe
        onLoad={() => setIsLoading(false)}
        className={`${isLoading ? "loading" : ""}`}
        title="sheet preview"
        src={doc.current.embedUrl}
      />
      <BallTriangle
        height={100}
        width={100}
        radius={5}
        ariaLabel="ball-triangle-loading"
        wrapperClass="loader-spinner"
        visible={isLoading}
      />
    </div>
  );
}
