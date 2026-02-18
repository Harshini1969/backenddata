const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");
const studentRoutes = require("./Routes/StudentRoutes");
const trainerRoutes = require("./Routes/TrainerRoutes");
const adminRoutes = require("./Routes/AdminRoutes");

const app = express();
connectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use(
  "/uploads",
  express.static("uploads")
);

app.use("/student", studentRoutes);
app.use("/trainer", trainerRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Server is Running");
});

app.listen(5000, () => {
  console.log("Server running");
});
