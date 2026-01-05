const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public"), { extensions: ["html"] }));

// Friendly routes (optional): /about -> /about.html
app.get("/:page", (req, res, next) => {
  const page = req.params.page;
  const file = path.join(__dirname, "public", `${page}.html`);
  res.sendFile(file, (err) => (err ? next() : null));
});

// Fallback to home
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Asianloop public site running on :${PORT}`));
