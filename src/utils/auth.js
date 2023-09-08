// public_api_key is restricted by http referrer to my website only.
//
// For development on localhost, I have a separate key stored in
// .env as DEV_API_KEY. This is ignored in version control
//

const public_api_key = "AIzaSyAfpJqpoeUGg8TlpCSyNxQSxkKu71uZqnA";

export const authParams = {
  client_id:
    "917800094388-7l1psptt380l0srblir0v7a7gi5t8472.apps.googleusercontent.com",
  scope:
    "https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive.readonly",
  api_key: process.env.DEV_API_KEY ? process.env.DEV_API_KEY : public_api_key,
};
