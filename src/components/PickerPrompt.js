import { authParams } from "../utils/auth";
import { google, driveScope } from "../utils/google";
import { useState } from "react";
import { PromptBox } from "./PromptBox";

export function PickerPrompt({
  disabled,
  tokenClient,
  token,
  setError,
  onPickerSelect: handlePickerSelect,
}) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const openPicker = () => {
    const pickerCallback = (data) => {
      if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
        handlePickerSelect(data[google.picker.Response.DOCUMENTS][0]);
      } else if (
        data[google.picker.Response.ACTION] === google.picker.Action.CANCEL
      ) {
        setError("User cancelled file picker.");
      }
      setIsLoading(false);
    };
    const picker = new google.picker.PickerBuilder()
      .addView(google.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(token.current)
      .setDeveloperKey(authParams.api_key)
      .setMaxItems(1)
      .setTitle("Choose the schedule to add to your calendar:")
      .setCallback(pickerCallback)
      .build();

    picker.setVisible(true);
    setPickerVisible(true);
  };

  const handleAuthButtonClick = async () => {
    setIsLoading(true);
    const res = await new Promise((resolve, reject) => {
      tokenClient.current.scope = driveScope;
      tokenClient.current.callback = resolve;
      try {
        tokenClient.current.requestAccessToken();
      } catch (e) {
        reject(e);
      }
    });
    if (res && res.access_token) {
      token.current = res.access_token;
      openPicker();
    } else {
      throw new Error("Did not receive a token in our response.");
    }
  };

  return (
    !pickerVisible && (
      <PromptBox isLoading={isLoading}>
        <h3 className="heading-tertiary">Click below to get started!</h3>
        <p>We will sign into your Google account to download the schedule.</p>
        <button
          className="btn"
          onClick={handleAuthButtonClick}
          disabled={disabled}
        >
          Choose Schedule
        </button>
      </PromptBox>
    )
  );
}
