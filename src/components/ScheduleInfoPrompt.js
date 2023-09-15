import { useEffect, useState } from "react";
import { PromptBox } from "./PromptBox";

import { IonIcon } from "@ionic/react";
import { alertCircleOutline } from "ionicons/icons";
import { ValidationError } from "../utils/util";

export function ScheduleInfoPrompt({ doc, onFormSubmit: handleFormSubmit }) {
  const [formInput, setFormInput] = useState({
    name: "",
    store: "blanshard",
    month: "",
  });
  const [validationError, setValidationError] = useState({
    name: null,
    store: null,
    month: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fill month based on doc prop
  useEffect(() => {
    if (doc.current === null) return;

    const monthRegex = /^.*(?<month>0[1-9]|1[0-2])\/(?<year>\d{4}).*$/;
    const monthMatch = doc.current.name.match(monthRegex);
    if (monthMatch) {
      setFormInput((formInput) => ({
        ...formInput,
        month: `${monthMatch.groups["year"]}-${monthMatch.groups["month"]}`,
      }));
    }
  }, [doc]);

  const stores = [
    {
      name: "blanshard",
      label: "Blanshard Street",
    },
    {
      name: "james bay",
      label: "James Bay",
    },
    {
      name: "downtown",
      label: "Discovery Street",
    },
    {
      name: "oak bay",
      label: "Oak Bay",
    },
  ];

  const handleFormChange = (property, value) => {
    setFormInput((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const validateInput = async () => {
    if (formInput.name.length === 1) {
      setValidationError((prev) => ({ ...prev, name: "Name is too short" }));
    }
    return Object.values(validationError).every((val) => val === null);
  };

  return (
    <PromptBox error={error} isLoading={isLoading}>
      <form
        className={`schedule-info-form ${isLoading ? "blur" : ""}`}
        onSubmit={async (e) => {
          e.preventDefault();
          if (validateInput()) {
            setIsLoading(true);
            try {
              await handleFormSubmit(formInput);
            } catch (e) {
              if (e instanceof ValidationError) {
                console.error(e);
                setValidationError(e);
              } else {
                setError(e);
              }
            }
            setIsLoading(false);
          }
        }}
      >
        <h3 className="heading-tertiary">
          Please add details of the selected schedule:
        </h3>
        <label htmlFor="name">Name on the schedule</label>
        <input
          required
          type="text"
          id="name"
          placeholder="Jamie"
          value={formInput.name}
          onChange={(e) => handleFormChange("name", e.target.value)}
          className={validationError.name ? "invalid" : ""}
          aria-invalid={validationError.name ? true : false}
          aria-describedby="name-error-msg"
        />
        {validationError.name && (
          <span className="error">
            <IonIcon icon={alertCircleOutline} />
            <span id="name-error-msg"> {validationError.name}</span>
          </span>
        )}
        <label htmlFor="store">What store is this schedule for?</label>
        <select
          required
          id="store"
          value={formInput.store}
          onChange={(e) => handleFormChange("store", e.target.value)}
          className={validationError.store ? "invalid" : ""}
          aria-invalid={validationError.store ? true : false}
          aria-describedby="store-error-msg"
        >
          {stores.map((store) => (
            <option key={store.name} value={store.name}>
              {store.label}
            </option>
          ))}
        </select>
        {validationError.store && (
          <span className="error">
            <IonIcon icon={alertCircleOutline} />
            <span id="store-error-msg"> {validationError.store}</span>
          </span>
        )}
        <label htmlFor="month">What month is this schedule for?</label>
        <input
          required
          type="month"
          id="month"
          value={formInput.month}
          onChange={(e) => handleFormChange("month", e.target.value)}
          className={validationError.month ? "invalid" : ""}
          aria-invalid={validationError.month ? true : false}
          aria-describedby="month-error-msg"
        />
        {validationError.month && (
          <span className="error">
            <IonIcon icon={alertCircleOutline} />
            <span id="month-error-msg"> {validationError.month}</span>
          </span>
        )}
        <button className="btn" type="submit">
          Submit
        </button>
      </form>
    </PromptBox>
  );
}
