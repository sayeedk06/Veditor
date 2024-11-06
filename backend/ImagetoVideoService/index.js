const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const app = express();
const port = 7000;
require("dotenv").config();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from any origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true // Allow cookies and authorization headers
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(fileUpload());

// Parse urlencoded bodies for POST form parameters
app.use(express.urlencoded({ extended: true }));
const videoRoutes = require("./routes/video.js");

app.use("/api/video", videoRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});