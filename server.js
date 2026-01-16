require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");

const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SESSION_SECRET || "secretkey",
  resave: false,
  saveUninitialized: false
}));

app.set("view engine", "ejs");

app.use("/", authRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
