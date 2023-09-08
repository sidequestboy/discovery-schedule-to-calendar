import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const google = (window.google = window.google ? window.google : {});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const gapi = (window.gapi = window.gapi ? window.gapi : {});

export const driveScope = "https://www.googleapis.com/auth/drive.readonly";
export const calendarScope = "https://www.googleapis.com/auth/calendar";

export function initTokenClient(authParams, scope) {
  if (authParams === null) return null;
  const tokenClient = google.accounts.oauth2.initTokenClient({
    ...authParams,
    scope: scope,
    include_granted_scopes: true,
    callback: "",
  });
  return tokenClient;
}

export async function initGapi(authParams) {
  if (authParams === null) return null;
  await new Promise((resolve, reject) =>
    gapi.load("picker", { callback: resolve, onerror: reject })
  );
  await new Promise((resolve, reject) =>
    gapi.load("client", { callback: resolve, onerror: reject })
  );
  gapi.client.setApiKey(authParams.api_key);
}

export const getSheets = async (id) => {
  await gapi.client.load(
    "https://sheets.googleapis.com/$discovery/rest?version=v4"
  );
  const res = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: id,
    fields: "sheets.properties",
  });
  const sheets = await Promise.all(
    res.result.sheets.map((sheet) =>
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: id,
        range: sheet.properties.title,
      })
    )
  );
  return sheets;
};

export function useGoogle(authParams) {
  const tokenClient = useRef(null);

  const [gsiLoaded, setGsiLoaded] = useState(false);
  const [gapiLoaded, setGapiLoaded] = useState(false);

  useEffect(() => {
    tokenClient.current = initTokenClient(authParams, driveScope);
    setGsiLoaded(true);
    initGapi(authParams).then(() => setGapiLoaded(true));
  }, [authParams]);

  return { tokenClient, gsiLoaded, gapiLoaded };
}
