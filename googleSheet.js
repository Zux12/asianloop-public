const { google } = require("googleapis");

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets"
  ]
});

const sheets = google.sheets({
  version: "v4",
  auth
});

module.exports = sheets;
