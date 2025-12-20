// app.js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res
    .status(200)
    .send("<h1>Welcome to the CI/CD Workshop! (DEV DEMO 10:26:15) (DEV DEMO 10:18:16)</h1>");
});

module.exports = app;
// demo 2025-12-20_10:06:41
