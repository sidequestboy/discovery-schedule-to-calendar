// Not sensitive secrets
// api_key is restricted by http referrer to my website
// use a separate developer api_key for development.
const authParams = {
  client_id:
    "917800094388-7l1psptt380l0srblir0v7a7gi5t8472.apps.googleusercontent.com",
  scope:
    "https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.readonly",
  api_key: "AIzaSyAfpJqpoeUGg8TlpCSyNxQSxkKu71uZqnA",
};

export { authParams };
