const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const port = 8000;
require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

// Parse urlencoded bodies for POST form parameters
app.use(express.urlencoded({ extended: true }));

// const webclientRoute = require("./routes/webclient.js");
const authenticationRoutes = require("./routes/authentication.js");
const userRoutes = require("./routes/user.js");

app.use("/api/authentication", authenticationRoutes);
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});