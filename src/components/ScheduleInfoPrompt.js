import { useEffect, useState } from "react";
import { PromptBox } from "./PromptBox";

export function ScheduleInfoPrompt({ doc, onFormSubmit: handleFormSubmit }) {
  const [formInput, setFormInput] = useState({
    name: "",
    store: "blanshard",
    month: "",
  });
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <PromptBox isLoading={isLoading}>
      <form
        className={`schedule-info-form ${isLoading ? "blur" : ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          setIsLoading(true);
          handleFormSubmit(formInput);
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
        />
        <label htmlFor="store">What store is this schedule for?</label>
        <select
          required
          id="store"
          value={formInput.store}
          onChange={(e) => handleFormChange("store", e.target.value)}
        >
          {stores.map((store) => (
            <option key={store.name} value={store.name}>
              {store.label}
            </option>
          ))}
        </select>
        <label htmlFor="month">What month is this schedule for?</label>
        <input
          required
          type="month"
          id="month"
          value={formInput.month}
          onChange={(e) => handleFormChange("month", e.target.value)}
        />
        <button className="btn" type="submit">
          Submit
        </button>
      </form>
    </PromptBox>
  );
}
