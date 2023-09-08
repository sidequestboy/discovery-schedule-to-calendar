import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/general.css";
import "./styles/styles.css";
import "./styles/queries.css";
import App from "./components/App";
// import { GoogleOAuthProvider } from "@react-oauth/google";

// const authParams = {
//   client_id:
//     "917800094388-7l1psptt380l0srblir0v7a7gi5t8472.apps.googleusercontent.com",
//   scope:
//     "https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.readonly",
//   api_key: "AIzaSyAfpJqpoeUGg8TlpCSyNxQSxkKu71uZqnA",
// };

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <GoogleOAuthProvider clientId={authParams.client_id}>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  // </GoogleOAuthProvider>,
);
